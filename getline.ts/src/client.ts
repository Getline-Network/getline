import {BigNumber} from 'bignumber.js';
import * as Web3 from 'web3';
import * as moment from 'moment';

import {MetabackendClient} from './metabackend';
import {Loan, BlockToTime} from './loan';

import {Metabackend} from './generated/metabackend_pb_service';
import * as pb from "./generated/metabackend_pb";

export class Client {
    private metabackend: MetabackendClient;
    private network: string;
    private web3: Web3;
    private contractDefinitions: Array<pb.Contract> | undefined;

    public TEST_TOKEN = "0x02c9ccaa1034a64e3a83df9ddce30e6d4bc40515";

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
                gas: 4612388,
                data: bytecode,
            };
            console.log("getline.ts: deploying contract " + contractName);
            console.log("getline.ts: deploying bytecode " + bytecode);
            console.log("getline.ts:    with parameters " + params);
            let instance: T = contractAny.new(...params, opts, (err, c: T) =>{
                if (err) {
                    reject(new Error("deployment failed: " + err));
                    return;
                }
                if (!c.address) {
                    console.log("getline.ts: deploying...");
                    return;
                }
                console.log("getline.ts: deployed at " + c.address);
                resolve(contractAny.at(c.address));
            });
        });
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
    }

    private getCurrentBlock(): Promise<number> {
        return new Promise<number>((result, reject)=>{
            this.web3.eth.getBlockNumber((err, block: number)=>{
                if (err) {
                    reject(err);
                    return;
                }
                result(block);
            });
        });
    }

    private blockToTime = (current: BigNumber, block: BigNumber): moment.Moment => {
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

        let currentBlock = await this.getCurrentBlock();
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
        return new Loan(res.getLoanCacheList()[0], currentBlock, this.blockToTime);
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
        let currentBlock = new BigNumber(await this.getCurrentBlock());
        res.getLoanCacheList().forEach((elem) => {
            loans.push(new Loan(elem, currentBlock, this.blockToTime));
        });
        return loans;
    }
}
