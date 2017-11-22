import * as Web3 from 'web3';
import {BigNumber} from 'bignumber.js';
import * as moment from 'moment';

import {Address} from './common';
import {MetabackendClient, pb} from './metabackend';

/**
 * A connector used to access blockchains.
 */
export interface Blockchain {
    /**
     * Convert a given block number in the future to a timestamp when it lands
     * on the blockchain.
     * @param current Current block number.
     * @param target Block number in the future.
     * @returns Timestamp of target block number.
     */
    blockToTime(current: BigNumber, target: BigNumber): moment.Moment;
    /**
     * Returns current top block number on the blockchain.
     * @returns Block number.
     */
    currentBlock(): Promise<BigNumber>;
    /**
     * Retrieves a handle to a contract at an address on the blockchain.
     * @param name Name of contract on the metabackend.
     * @param address Address of contract on the blockchain.
     * @returns Contract at this address.
     */
    existing(name: string, address: Address): Promise<Contract>;
    /**
     * Deploys a new contract on the blockchain.
     * @param name Name of contract on the metabackend.
     * @param params Constructor parameters of the contract.
     * @returns Newly deployed contract.
     */
    deploy(name: string, ...params: Array<any>): Promise<Contract>;
    /**
     * Returns coinbase of the blockchain client.
     * @returns Coinbase address.
     */
    coinbase(): Promise<Address>;
    /**
     * Waits until a given transaction is mined, by hash.
     * @param hash Transaction hash for which to wait.
     */
    waitTxMined(hash: string): Promise<void>;
}

/**
 * A contract deployed on a blockchain.
 */
export class Contract {
    /**
     * Address of the contract on the blockchain.
     */
    public readonly address: Address
    /**
     * Blockchain on which the contract is located.
     */
    private blockchain: Blockchain
    private instance: Web3.ContractInstance

    constructor(blockchain: Blockchain, instance: Web3.ContractInstance) {
        this.blockchain = blockchain;
        this.instance = instance;
        this.address = new Address(this.blockchain, instance.address);
    }

    /**
     * Call a contract method.
     * @param methodName Name of method to call.
     * @param params Arguments to pass to method.
     * @returns Result of call.
     */
    public async call<T>(methodName: string, ...params: Array<any>): Promise<T> {
        let method: any = this.instance[methodName];
        return new Promise<T>((resolve, reject)=>{
            let opts = {
                gas: 1000000,
            }
            method(...params, opts, (err: Error, object: T)=>{
                if (err != undefined) {
                    reject(err);
                    return;
                }
                resolve(object);
            });
        });
    }

    /**
     * Call a contract method that mutates the contract's state (sends a
     * transaction to the blockchain) and wait until that transaction gets
     * mined.
     * @param methodName Name of method to call.
     * @param params Arguments to pass to method.
     * @throws Error when the transaction does not get mined within 60
     *               seconds.
     */
    public async mutate(methodName: string, ...params: Array<any>): Promise<void> {
        // Build a transaction and get its' hash.
        let hash = await this.call<string>(methodName, ...params)
        // Wait until transaction hash gets mined into a block.
        await this.blockchain.waitTxMined(hash);
    }
}

// TypeScript doesn't seem to have an index method on window - let's make our
// own interface for that.
interface WindowIndexable {
    [key: string]: any;
}

/**
 * Implementation of the Blockchain interface that uses the Getline metabackend
 * and web3.
 */
export class GetlineBlockchain {
    private metabackend: MetabackendClient;
    private network: string;
    private web3: Web3;
    private contractDefinitions: Array<pb.Contract> | undefined;
    private debug: boolean;

    private log(...msg: Array<string>) {
        if (!this.debug) {
            return;
        }
        console.log("[getline.ts/blockchain] ", ...msg);
    }

    constructor(metabackend: MetabackendClient, network: string, provider: Web3.Provider | undefined, debug?: boolean) {
        this.metabackend = metabackend;
        this.network = network;

        if (debug == undefined) {
            debug = false;
        }
        this.debug = debug;

        if (provider == undefined) {
            if (typeof window != "undefined" && (<WindowIndexable>window)['web3'] != undefined) {
                this.log("using injected web3")
                provider = (<WindowIndexable>window)['web3'].currentProvider;
            } else {
                this.log("connecting to node running on localhost")
                provider = new Web3.providers.HttpProvider("http://localhost:8545")
            }
        } else {
            this.log("using user-injected provider")
        }
        this.web3 = new Web3(provider);
    }

    public async initialize(): Promise<void> {
        return new Promise<void>((resolve, reject)=>{
            this.web3.version.getNetwork((e, network)=>{
                if (e != null) {
                    reject(new Error("Could not initialize getline.ts: " + e));
                    return;
                }
                if (network != this.network) {
                    reject(new Error(`Connected to wrong network (got ${network}, expected ${this.network})`));
                    return;
                }
                this.web3.eth.getAccounts((e, accounts)=>{
                    if (e != null) {
                        reject(new Error("Could not initialize getline.ts: " + e));
                    }
                    if (accounts.length < 1) {
                        reject(new Error("No accounts available"));
                    }
                    this.web3.eth.defaultAccount = accounts[0];
                    resolve();
                });
            });
        });
    }

    /**
     * Waits until a given transaction hash is present on the blockchain.
     *
     * This is a hack that had to be written for when web3.ether.contract.new
     * fails to run the creation callback for the second time. When we upgrade
     * to web3 1.0 or another library we should be able to get rid of this.
     *
     * @param hash Hash of transaction to look for.
     */
    public async waitTxMined(hash: string): Promise<void> {
        return new Promise<void>((resolve, reject)=>{
            // Wait for a minute.
            // TODO(q3k): Make this configurable.
            const timeout = 60 * 1000;
            // Poll interval (2 seconds);
            const poll = 2 * 1000;

            let retries = timeout / poll;
            let interval = setInterval(()=>{
                retries -= 1;
                if (retries <= 0) {
                    clearInterval(interval);
                    reject(new Error("Transaction not mined on time"));
                    return;
                }

                this.web3.eth.getTransactionReceipt(hash, (e, receipt)=>{
                    if (!receipt) {
                        return;
                    }
                    clearInterval(interval);
                    resolve(undefined);
                });
            }, poll);
        });
    }

    /**
     * Waits until a given contract is deployed on the network.
     *
     * @param hash Transactiion hash of transaction that deployed contract.
     * @param name Name of contract.
     * @returns Newly deployed contract.
     */
    private async waitContractDeployed(hash: string, name: string): Promise<Contract> {
        await this.waitTxMined(hash)
        return new Promise<Contract>((resolve, reject)=>{
            this.web3.eth.getTransactionReceipt(hash, (e, receipt)=>{
                if (!receipt) {
                    reject(new Error("Contract disappeared from the network?"));
                    return;
                }

                const address: string | null = receipt.contractAddress;
                if (address == null) {
                    reject(new Error("Contract did not get deployed"));
                    return;
                }

                this.web3.eth.getCode(address, (e, code)=>{
                    if (!code || code.length < 3) {
                        reject(new Error("Contract did not get stored"));
                        return;
                    }

                    this.existing(name, new Address(this, address)).then(resolve).catch(reject);
                });
            });
        });
    }

    public async deploy(contractName: string, ...params: Array<any>): Promise<Contract> {
        let abi = await this.metabackend.getABI(contractName);
        let contract = this.web3.eth.contract(abi);
        let bytecode = await this.metabackend.getBytecode(contractName);

        return new Promise<Contract>((resolve, reject)=>{
            // TODO(q3k): Typify Web3.Contract.new
            let contractAny: any = contract;

            let opts = {
                from: this.web3.eth.coinbase,
                gas: 4500000,
                data: bytecode,
            };
            this.log("deploying contract " + contractName);
            this.log("deploying bytecode " + bytecode.substring(0, 64) + "...");
            this.log("   with parameters " + params);

            let confirmed = false;
            let instance = contractAny.new(...params, opts, (err: Error, c: Web3.ContractInstance) =>{
                if (err) {
                    console.error("getline.ts: deployment failed: " + err.stack);
                    reject(new Error("deployment failed: " + err));
                    return;
                }

                // Make sure this callback gets fired only once...
                if (confirmed) {
                    return;
                }
                confirmed = true;

                this.log("deploying...");
                this.waitContractDeployed(c.transactionHash, contractName).then(resolve).catch(reject);
            });
        });
    }

    public async existing(name: string, address: Address): Promise<Contract> {
        let abi = await this.metabackend.getABI(name);
        let deployed = this.web3.eth.contract(abi).at(address.ascii);
        return new Contract(this, deployed);
    }

    public async coinbase(): Promise<Address> {
        return new Address(this, this.web3.eth.accounts[0]);
    }

    public currentBlock(): Promise<BigNumber> {
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

}

