import {BigNumber} from "bignumber.js";
import * as debug from "debug";
import * as moment from "moment";
import * as Web3 from "web3";

import {Address} from "./common";
import {MetabackendClient, pb} from "./metabackend";

const logger = debug("getline.ts:blockchain");

export class UserVisibleError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

/**
 * Ethereum Provider (ie. Metamask) has its' main account locked.
 */
export class ProviderLocked extends UserVisibleError {
    constructor() {
        super("Ethereum provider is locked.");
    }
}

/**
 * Ethereum Provider (ie. Metamask) is not on a supported blockchain.
 */
export class ProviderOnUnsupportedNetwork extends UserVisibleError {
    constructor(got: string) {
        super("Ethereum provider is on unsupported network: " + got);
    }
}

/**
 * Ethereum Provider (ie. Metamask) thrown an unexpected error on initialization.
 * This can happen if we're using the default localhost:8545 web3 provider
 * but it's not running.
 */
export class ProviderInitializationError extends UserVisibleError {
    constructor(err: Error) {
        super("Error from ethereum provider: " + err);
    }
}

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
    deploy(name: string, ...params: any[]): Promise<Contract>;
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
    public readonly address: Address;
    /**
     * Blockchain on which the contract is located.
     */
    private blockchain: Blockchain;
    private instance: Web3.ContractInstance;

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
    public async call<T>(methodName: string, ...params: any[]): Promise<T> {
        logger(`Calling ${methodName}...`);
        const method: any = this.instance[methodName];
        return new Promise<T>((resolve, reject) => {
            const opts = {
                gas: 1000000,
            };
            method.call(...params, opts, (err: Error, object: T) => {
                if (err !== null) {
                    logger(`Failed: ${err}`);
                    reject(err);
                    return;
                }
                logger("Sucess.");
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
    public async mutate(methodName: string, ...params: any[]): Promise<void> {
        logger(`Mutating ${methodName}...`);
        const method: any = this.instance[methodName];
        const gas: number = await (new Promise<number>((resolve, reject) => {
            const fallback = 300000;
            const opts = {
                gas: 1000000,
            };
            method.estimateGas(...params, opts, (err: Error, cost: number) => {
                if (err !== null) {
                    logger(`Failed to estimate mutation gas consumption, falling back to default gas `
                           + `(${fallback}): ${err}`);
                    resolve(fallback);
                    return;
                }
                logger(`Estimated gas consumption: ${cost}`);
                resolve(cost);
            });
        }));
        const hash: string = await (new Promise<string>((resolve, reject) => {
            const opts = {
                gas: Math.floor(gas * 2),
            };
            method.sendTransaction(...params, opts, (err: Error, object: string) => {
                if (err !== null) {
                    logger(`Failed: ${err}`);
                    reject(err);
                    return;
                }
                logger("Sucess.");
                resolve(object);
            });
        }));
        // Wait until transaction hash gets mined into a block.
        await this.blockchain.waitTxMined(hash);
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
    private contractDefinitions: pb.Contract[] | undefined;

    constructor(metabackend: MetabackendClient, network: string, provider: Web3.Provider | undefined) {
        this.metabackend = metabackend;
        this.network = network;

        if (provider === undefined) {
            if (typeof window !== "undefined" && (window as any).web3 !== undefined) {
                logger("Using injected web3");
                provider = (window as any).web3.currentProvider;
            } else {
                logger("Connecting to node running on localhost");
                provider = new Web3.providers.HttpProvider("http://localhost:8545");
            }
        } else {
            logger("Using user-injected provider");
        }
        this.web3 = new Web3(provider);
    }

    public async initialize(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.web3.version.getNetwork((e, network) => {
                if (e != null) {
                    reject(new ProviderInitializationError(e));
                    return;
                }
                if (network !== this.network) {
                    reject(new ProviderOnUnsupportedNetwork(network));
                    return;
                }
                this.web3.eth.getAccounts((e2, accounts) => {
                    if (e2 !== null) {
                        reject(new ProviderInitializationError(e));
                    }
                    if (accounts.length < 1) {
                        reject(new ProviderLocked());
                    }
                    this.web3.eth.defaultAccount = accounts[0];
                    logger("Current user is " + this.web3.eth.defaultAccount);
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
        return new Promise<void>((resolve, reject) => {
            // Wait for a minute.
            // TODO(q3k): Make this configurable.
            const timeout = 60 * 1000;
            // Poll interval (2 seconds);
            const poll = 2 * 1000;

            let retries = timeout / poll;
            logger("Starting transaction receipt waiter for " + hash);
            const interval = setInterval(() => {
                logger(`Retries left: ${retries}`);
                retries -= 1;
                if (retries <= 0) {
                    clearInterval(interval);
                    reject(new Error("Transaction not mined on time"));
                    return;
                }

                this.web3.eth.getTransactionReceipt(hash, (e, receipt) => {
                    if (!receipt) {
                        logger(`No receipt yet.`);
                        return;
                    }
                    logger(`Receipt found.`);
                    clearInterval(interval);
                    resolve(undefined);
                });
            }, poll);
        });
    }

    public async deploy(contractName: string, ...params: any[]): Promise<Contract> {
        const abi = await this.metabackend.getABI(contractName);
        const contract = this.web3.eth.contract(abi);
        const bytecode = await this.metabackend.getBytecode(contractName);

        const gas: number = await (new Promise<number>((resolve, reject) => {
            const fallback = 2000000;
            const data = contract.getData(...params, { data: bytecode });
            this.web3.eth.estimateGas({data}, (err: Error, cost: number) => {
                if (err !== null) {
                    logger(`Failed to estimate deployment gas consumption, falling back to default gas `
                           + `(${fallback}): ${err}`);
                    resolve(fallback);
                    return;
                }
                logger(`Estimated gas consumption for contract deployment: ${cost}`);
                resolve(cost);
            });
        }));

        return new Promise<Contract>((resolve, reject) => {

            const opts = {
                data: bytecode,
                from: this.web3.eth.coinbase,
                gas: Math.floor(gas * 1.1),
            };
            logger("Deploying contract " + contractName);
            logger("Deploying bytecode " + bytecode.substring(0, 64) + "...");
            logger("With parameters " + params);

            let confirmed = false;
            const instance = contract.new(...params, opts, (err: Error, c: Web3.ContractInstance) => {
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

                logger("Deploying...");
                this.waitContractDeployed(c.transactionHash, contractName).then(resolve).catch(reject);
            });
        });
    }

    public async existing(name: string, address: Address): Promise<Contract> {
        const abi = await this.metabackend.getABI(name);
        const deployed = this.web3.eth.contract(abi).at(address.ascii);
        return new Contract(this, deployed);
    }

    public async coinbase(): Promise<Address> {
        return new Address(this, this.web3.eth.accounts[0]);
    }

    public currentBlock(): Promise<BigNumber> {
        // TODO(q3k): Cache this?
        return new Promise<BigNumber>((result, reject) => {
            this.web3.eth.getBlockNumber((err, block: number) => {
                if (err) {
                    reject(err);
                    return;
                }
                result(new BigNumber(block));
            });
        });
    }

    public blockToTime(current: BigNumber, block: BigNumber): moment.Moment {
        if (this.network !== "4") {
            throw new Error("getline.ts only supports rinkeby chains");
        }
        const secondsPerBlock = new BigNumber(15);
        const seconds = block.minus(current).times(secondsPerBlock);

        return moment(moment.now()).add(seconds.toNumber(), "seconds");
    }

    /**
     * Waits until a given contract is deployed on the network.
     *
     * @param hash Transactiion hash of transaction that deployed contract.
     * @param name Name of contract.
     * @returns Newly deployed contract.
     */
    private async waitContractDeployed(hash: string, name: string): Promise<Contract> {
        logger(`Waiting for ${name} to be deployed by tx ${hash}`);
        await this.waitTxMined(hash);
        return new Promise<Contract>((resolve, reject) => {
            this.web3.eth.getTransactionReceipt(hash, (e, receipt) => {
                if (!receipt) {
                    reject(new Error("Contract disappeared from the network?"));
                    return;
                }

                const address: string | null = receipt.contractAddress;
                if (address == null) {
                    reject(new Error("Contract did not get deployed"));
                    return;
                }

                this.web3.eth.getCode(address, (e2, code) => {
                    if (!code || code.length < 3) {
                        reject(new Error("Contract did not get stored: " + e2));
                        return;
                    }

                    logger("Contract deployed at " + address);
                    this.existing(name, new Address(this, address)).then(resolve).catch(reject);
                });
            });
        });
    }
}
