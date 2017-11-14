import {BigNumber} from 'bignumber.js';
import * as Web3 from 'web3';
import * as moment from 'moment';

import {MetabackendClient} from './metabackend';
import {Loan} from './loan';

import {Metabackend} from './generated/metabackend_pb_service';
import * as pb from "./generated/metabackend_pb";

/**
 * Getline client library.
 *
 * This library lets you view and manage Getline.in loans programatically.
 * It runs under node.js and in Chrome with the Metamask extension. You will
 * be automatically logged in as the first address from your web3 provider.
 *
 * The library is fully async/await compatible, which means you can use it
 * both with `Promise.then/.catch` and `await` blocks. All calls that interact
 * with the blockchain will block until the result propagates.
 *
 * Currently this library **only allows you to create loans on the Rinkeby
 * testnet** - this is by design until we go out of demo.
 *
 */
export class Client {
    private metabackend: MetabackendClient;
    private network: string;
    private web3: Web3;
    private contractDefinitions: Array<pb.Contract> | undefined;

    /**
     * Token that is used for collateral and loans in the demo.
     */
    public TEST_TOKEN = "0x02c9ccaa1034a64e3a83df9ddce30e6d4bc40515";

    /**
     * Waits until a given Web3 contract is deployed on the blockchain.
     *
     * This is a hack that had to be written for when web3.ether.contract.new 
     * fails to run the creation callback for the second time. When we upgrade
     * to web3 1.0 or another library we should be able to get rid of this.
     *
     * @param T Web3 contract type.
     * @param contract Web3 contract object to wait on.
     * @param resolve Callback when contract appears on blockchain.
     * @param reject Callback when contract fails to appear on blockchain
     *               within 200 seconds.
     */
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

    /**
     * Deploys a Web3 contract loaded from the metabackend on the blockchain.
     *
     * This will block until the contract is confirmed deployed.
     *
     * @param T Web3 contract instance type.
     * @param contractName Name of the contract to load from the metabackend.
     * @param params Arguments passsed to the contract constructor.
     * @returns Web3 contract object.
     */
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

    /**
     * Returns a metabackend contract as a Web3 contract object at a given address.
     *
     * @param name Name of the contract on the metabackend.
     * @param address Address at which the contract runs.
     * @returns Instantiated Web3 contract.
     */
    public async getContractInstance<T extends Web3.ContractInstance>(name: string, address: string): Promise<T> {
        let abi = await this.metabackend.getABI(name);
        let contract = this.web3.eth.contract(abi).at(address);
        return contract;
    }

    /**
     * Returns coinbase of API client.
     *
     * @returns Ethereum address of coinbase.
     */
    public async getCoinbase(): Promise<string> {
        return this.web3.eth.coinbase;
    }

    /**
     * Creates a new Getline client.
     *
     * @param metabackend Address of metabackend. Production address is
     *                    `https://0.api.getline.in`.
     * @param network Network identifier. Currently only `"4"` (Rinkeby) is
     *                supported.
     */
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

    /**
     * Returns highest block number on blockchain.
     *
     * @returns Block number.
     */
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

    /**
     * Converts a given block number (with current highest block number) to a
     * timestamp of when that block will occur.
     *
     * This only really works in Rinkeby, and is only used with the current
     * smart contract code that is based on block numbers. This will be removed
     * in the future.
     *
     * @param current Current block number.
     * @param block Block number in the future that we want to get timestamp of.
     * @return timestamp of `block`.
     */
    public blockToTime(current: BigNumber, block: BigNumber): moment.Moment {
        if (this.network != "4") {
            throw new Error("getline.ts only supports rinkeby chains");
        }
        let secondsPerBlock = new BigNumber(15);
        let seconds = block.minus(current).times(secondsPerBlock);

        return moment(moment.now()).add(seconds.toNumber(), 'seconds');
    }

    /**
     * Creates a new Getline Loan on the blockchain and indexes it in the
     * Getline system.
     *
     * Currently these loans use `TEST_TOKEN` as both the collateral and loan
     * token. This will be changed in the future.
     *
     * @param description Human-readable description of loan. Markdown.
     * @param amount Amount of loan requested.
     * @param interestPermil Loan interest in permil.
     * @param fundraisingDelta Number of seconds from loan creation until
     *                         fundraising ends.
     * @param paybackDelta Number of seconds from loan creation until loan
     *                     must be paid back. This cannot be earlier than
     *                     `fundraisingDelta`.
     * @returns Newly created loan.
     */
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

    /**
     * Returns loan identifier by a given short identifier.
     *
     * @param shortId Short identifier of loan (`shortId` member of a `Loan`
     *                object).
     * @returns Loan identifier by shortId.
     */
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

    /**
     * Returns all loans owned by a given address, regardless of their state.
     *
     * @param owner Ethereum address of owner/liege.
     * @returns Loans owned by `owner`.
     */
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
