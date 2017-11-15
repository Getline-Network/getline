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
    public async call(methodName: string, ...params: Array<any>): Promise<any> {
        let method: any = this.instance[methodName];
        return new Promise<any>((resolve, reject)=>{
            let opts = {
                gas: 1000000,
            }
            method(...params, opts, (err, object)=>{
                if (err != undefined) {
                    reject(err);
                    return;
                }
                resolve(object);
            });
        });
    }
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

    constructor(metabackend: MetabackendClient, network: string, provider: Web3.Provider | undefined) {
        this.metabackend = metabackend;
        this.network = network;

        if (provider == undefined) {
            if (typeof window !== 'undefined' && typeof window['web3'] !== 'undefined') {
                console.log("getline.ts: using injected web3")
                provider = window['web3'].currentProvider;
            } else {
                console.log("getline.ts: connecting to node running on localhost")
                provider = new Web3.providers.HttpProvider("http://localhost:8545")
            }
        } else {
            console.log("getline.ts: using user-injected provider")
        }

        this.web3 = new Web3(provider);
        if (this.web3.version.network != this.network) {
            throw new Error("web3 is connected to wrong network")
        }
        this.web3.eth.defaultAccount = this.web3.eth.accounts[0];
    }

    /**
     * Waits until a given Web3 contract is deployed on the blockchain.
     *
     * This is a hack that had to be written for when web3.ether.contract.new 
     * fails to run the creation callback for the second time. When we upgrade
     * to web3 1.0 or another library we should be able to get rid of this.
     *
     * @param T Web3 contract type.
     * @param contract Web3 contract object to wait on.
     * @returns Address of new contract.
     */
    private async waitTxReceipt(contract: Web3.ContractInstance): Promise<Address> {
        return new Promise<Address>((resolve, reject)=>{
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
                            resolve(new Address(this, receipt.contractAddress));
                        } else {
                            clearInterval(interval);
                            reject(new Error("contract did not get stored"));
                        }
                    });
                });
            }, 5000);
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
            console.log("getline.ts: deploying contract " + contractName);
            console.log("getline.ts: deploying bytecode " + bytecode.substring(0, 64) + "...");
            console.log("getline.ts:    with parameters " + params);

            let confirmed = false;
            let instance = contractAny.new(...params, opts, (err, c) =>{
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

                console.log("getline.ts: deploying...");
                this.waitTxReceipt(c).then((address)=>{
                    console.log("getline.ts: deployed at " + address.ascii);
                    let deployed = this.web3.eth.contract(abi).at(address.ascii);
                    resolve(new Contract(this, deployed));
                }).catch(reject);
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

