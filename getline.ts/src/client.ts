import {BigNumber} from 'bignumber.js';
import * as Web3 from 'web3';
import * as moment from 'moment';

import {MetabackendClient} from './metabackend';
import {Loan} from './loan';

import {Metabackend} from './generated/metabackend_pb_service';
import * as pb from "./generated/metabackend_pb";

export class Client {
    private metabackend: MetabackendClient;
    private network: string;
    private web3: Web3;
    private contractDefinitions: Array<pb.Contract> | undefined;

    public TEST_TOKEN = "0x02c9ccaa1034a64e3a83df9ddce30e6d4bc40515";

    private waitTxReceipt<T extends Web3.ContractInstance>
                         (contract: T, resolve: (c: T)=>void, reject: (e: Error)=>void) {
        let retries = 20;
        let interval = setInterval(()=>{
            console.log("getline.ts: checking for deployed contract " + contract.transactionHash + " ...");
            retries -= 1;
            if (retries <= 0) {
                clearInterval(interval);
                reject(new Error("Contract not deployed on time"));
                return;
            }

            this.web3.eth.getTransactionReceipt(contract.transactionHash, (e, receipt)=>{
                if (!receipt) {
                    return;
                }

                this.web3.eth.getCode(receipt.contractAddress, (e, code)=>{
                    if (!code) {
                        return;
                    }

                    if (code.length > 3) {
                        clearInterval(interval);

                        contract.address = receipt.contractAddress;
                        resolve(contract);
                    } else {
                        clearInterval(interval);

                        reject(new Error("contract did not get stored"));
                    }
                });
            });
        }, 5000);
    }

    private async deployContract<T extends Web3.ContractInstance>
                          (contractName: string, ...params: Array<any>): Promise<T> {
        let abi = await this.metabackend.getABI(contractName);
        let contract = this.web3.eth.contract(abi);
        let bytecode = await this.metabackend.getBytecode(contractName);

        return new Promise<T>((resolve, reject)=>{
            // TODO(q3k): Typify Web3.Contract.new
            let contractAny: any = contract;

            let opts = {
                from: this.web3.eth.coinbase,
                gas: 4500000,
                data: bytecode,
            };
            console.log("getline.ts: deploying contract " + contractName);
            console.log("getline.ts: deploying bytecode " + bytecode.substring(0, 64) + "...");
            console.log("getline.ts:    with parameters " + params);
            let instance: T = contractAny.new(...params, opts, (err, c: T) =>{
                if (err) {
                    console.log("getline.ts: deployment failed: " + err.stack);
                    reject(new Error("deployment failed: " + err));
                    return;
                }
                if (!c.address) {
                    console.log("getline.ts: deploying...");
                    this.waitTxReceipt(c, (res: T) => { resolve(res) }, reject);
                    return;
                }
            });
        });
    }

    public async getContractInstance<T extends Web3.ContractInstance>(name: string, address: string): Promise<T> {
        let abi = await this.metabackend.getABI(name);
        let contract = this.web3.eth.contract(abi).at(address);
        return contract;
    }

    public async getCoinbase(): Promise<string> {
        return this.web3.eth.coinbase;
    }

    constructor(metabackend: string, network: string) {
        this.metabackend = new MetabackendClient(metabackend, network);
        this.network = network;
        let provider = new Web3.providers.HttpProvider("http://localhost:8545")
        if (typeof window !== 'undefined' && typeof window['web3'] !== 'undefined') {
            console.log("getline.ts: using injected web3")
            provider = window['web3'].currentProvider;
        } else {
            console.log("getline.ts: connecting to node running on localhost")
        }
        this.web3 = new Web3(provider);
        if (this.web3.version.network != this.network) {
            throw new Error("web3 is connected to wrong network")
        }
        this.web3.eth.defaultAccount = this.web3.eth.accounts[0];
    }

    public getCurrentBlock(): Promise<BigNumber> {
        // TODO(q3k): Cache this?
        return new Promise<BigNumber>((result, reject)=>{
            this.web3.eth.getBlockNumber((err, block: number)=>{
                if (err) {
                    reject(err);
                    return;
                }
                result(new BigNumber(block));
            });
        });
    }

    public blockToTime(current: BigNumber, block: BigNumber): moment.Moment {
        if (this.network != "4") {
            throw new Error("getline.ts only supports rinkeby chains");
        }
        let secondsPerBlock = new BigNumber(15);
        let seconds = block.minus(current).times(secondsPerBlock);

        return moment(moment.now()).add(seconds.toNumber(), 'seconds');
    }

    public async addNewLoan(description: string, amount: BigNumber, interestPermil: number,
                            fundraisingDelta: number, paybackDelta: number): Promise<Loan> {
        // TODO(q3k) change this when we're not on rinkeby and we have a better loan SC
        if (this.network != "4") {
            throw new Error("cannot place loan on non-rinkeby chains");
        }
        if (fundraisingDelta < 0) {
            throw new Error("cannot place loan with fundraising deadline in the past");
        }
        if (paybackDelta < 0) {
            throw new Error("cannot place loan with payback deadline in the past");
        }
        if (paybackDelta < fundraisingDelta) {
            throw new Error("cannot place loan with payback deadline before fundraising deadline");
        }

        let currentBlock = (await this.getCurrentBlock()).toNumber();
        let blocksPerSecond = (1.0) / 15;
        let fundraisingEnd = currentBlock + blocksPerSecond * fundraisingDelta;
        let paybackEnd = currentBlock + blocksPerSecond * paybackDelta;
        let loan = await this.deployContract('Loan',
            this.TEST_TOKEN, this.TEST_TOKEN,
            this.web3.eth.accounts[0],
             amount, interestPermil, fundraisingEnd, paybackEnd);

        let req = new pb.IndexLoanRequest();
        req.setNetworkId(this.network);
        req.setDescription(description);
        let address = new pb.Address();
        address.setAscii(loan.address);
        req.setLoan(address);

        let res = await this.metabackend.invoke(Metabackend.IndexLoan, req);
        console.log("getline.ts: indexed loan as " + res.getShortId());
        return this.getLoanByShortId(res.getShortId());
    }

    public async getLoanByShortId(shortId: string): Promise<Loan> {
        let req = new pb.GetLoansRequest();
        req.setNetworkId(this.network);
        req.setShortId(shortId);

        let res = await this.metabackend.invoke(Metabackend.GetLoans, req);
        if (res.getNetworkId() != this.network) {
            throw new Error("Invalid network ID in response.");
        }

        let currentBlock = new BigNumber(await this.getCurrentBlock());
        let loan = new Loan(this);
        await loan.loadFromProto(res.getLoanCacheList()[0]);
        return loan;
    }

    public async getLoansByOwner(owner: string): Promise<Array<Loan>> {
        let req = new pb.GetLoansRequest();
        req.setNetworkId(this.network);
        let address = new pb.Address();
        address.setAscii(owner);
        req.setOwner(address);

        let res = await this.metabackend.invoke(Metabackend.GetLoans, req);
        if (res.getNetworkId() != this.network) {
            throw new Error("Invalid network ID in response.");
        }

        let loans : Array<Loan> = [];
        let promises : Array<Promise<void>> = [];
        let currentBlock = new BigNumber(await this.getCurrentBlock());
        res.getLoanCacheList().forEach((elem) => {
            let loan = new Loan(this);
            promises.push(loan.loadFromProto(elem));
            loans.push(loan);
        });
        await Promise.all(promises);
        return loans;
    }
}
