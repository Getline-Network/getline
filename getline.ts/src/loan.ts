import {BigNumber} from 'bignumber.js';
import * as Web3 from 'web3';
import * as moment from 'moment';

import * as pb from './generated/metabackend_pb';


/**
 * Private interface between library and Loan object used to access blockchain.
 */
export interface Connector {
    blockToTime(current: BigNumber, target: BigNumber): moment.Moment;
    getCurrentBlock(): Promise<BigNumber>;
    getContractInstance<T extends Web3.ContractInstance>(name: string, address: string): Promise<T>;
    getCoinbase(): Promise<string>;
}

/**
 * State of a Getline Loan.
 */
export enum LoanState {
    /**
     * Loan is waiting for Collateral to be sent by owner.
     */
    CollateralCollection = 0,
    /**
     * Loan is raising funds by investors.
     */
    Fundraising,
    /**
     * Loan is being paid back by liege.
     */
    Payback,
    /**
     * Loan has been paid back or has defaulted.
     */
    Finished
}

/**
 * Representation of a GetLine Loan indexed by the system and running on the
 * blockchain.
 *
 * Example use:
 * 
 *     // Create a new loan for 10k Test Loan Tokens (only option for now)
 *     // that ends fundraising in a week and must be repaid in a month with
 *     // a 5% interest rate.
 *     let interestPermil = 50;
 *     let amount = new BigNumber(10000);
 *     let fundraisingEnds = 60*60*24*7;
 *     let paybackEnds = 60*60*24*30;
 *     let contract = await client.addNewLoan("test loan", amount, intersetPermil,
 *                                            fundraisingEnds, paybackEnds);
 *     // Now, pay collateral of 1k Test Loan Tokens.
 *     await contract.setCollateralAmount(new BigNumber(1000));
 *     await contract.sendCollateral();
 *     
 *     console.log("Loan " + contract.shortId + " is now fundraising!");
 */
export class Loan {
    /**
     * Parameters with which the loan got created on the blockchain. These are
     * always available and constant through the life of a loan.
     */
    public parameters: {
        /**
         * Address of ERC20-compatible token used as collateral for the loan.
         */
        collateralTokenAddress: string
        /**
         * Address of ERC20-compatible token used as loan.
         */
        loanTokenAddress: string
        /**
         * Address of owner/liege of loan.
         */
        liegeAddress: string
        /**
         * Date by which the loan needs to have all investment gathered.
         */
        fundraisingDeadline: moment.Moment
        /**
         * Date by which loan needs to be fully repaid.
         */
        paybackDeadline: moment.Moment
        /**
         * Amount of loan token wanted.
         */
        amountWanted: BigNumber
    }
    /**
     * A short identifier that is used to lookup the loan in the Getline
     * index system (metabackend). Opaque.
     */
    public shortId: string
    /**
     * User-given description of the loan.
     */
    public description: string
    /**
     * Ethereum address at which loan is deployed.
     */
    public address: string
    /**
     * Ethereum address of owner/liege of loan.
     */
    public owner: string

    /**
     * State of the loan on the blockchain. These change with time.
     * `updateStateFromBlockchain` should be called to update this data with the
     * freshest state from the blockchain.
     */
    public blockchainState: {
        /**
         * State of Loan contract.
         */
        loanState: LoanState
        /**
         * Value of loan token gathered in fundraising.
         */
        amountGathered: BigNumber
        /**
         * Whether the loan is currently raising funds from investors.
         */
        isFundraising: boolean
        /**
         * Whether the loan has been paid back succesfully.
         */
        isPaidback: boolean
        /**
         * Whether the loan has defaulted, ie. the liege has not paid back in
         * time.
         */
        isDefaulted: boolean
    }

    private connector: Connector

 
    /**
     * Private constructor used by the library.
     */
    constructor(connector: Connector) {
        this.connector = connector;
    }

    /**
     * Private method used by the library to load data from a metabackend
     * protobuf.
     */
    public async loadFromProto(proto: pb.LoanCache) {
        this.shortId = proto.getShortId();
        this.description = proto.getDescription();
        this.address = proto.getDeploymentAddress().getAscii();
        this.owner = proto.getOwner().getAscii();

        let currentBlock = await this.connector.getCurrentBlock();
        let blockToTime = (count: string)=>{
            return this.connector.blockToTime(currentBlock, new BigNumber(count));
        }

        let params = proto.getParameters();
        this.parameters = {
            collateralTokenAddress: params.getCollateralToken().getAscii(),
            loanTokenAddress: params.getLoanToken().getAscii(),
            liegeAddress: params.getLiege().getAscii(),
            fundraisingDeadline: blockToTime(params.getFundraisingBlocksCount()),
            paybackDeadline: blockToTime(params.getPaybackBlocksCount()),
            amountWanted: new BigNumber(params.getAmountWanted())
        };
    }

    private async callContract(method: any, ...params: Array<any>): Promise<any> {
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

    /**
     * Loads the newest state of the loan from the blockchain.
     */
    public async updateStateFromBlockchain(): Promise<void> {
        let Loan = await this.connector.getContractInstance('Loan', this.address);

        this.blockchainState = {
            loanState: (await this.callContract(Loan.currentState)).toNumber(),
            amountGathered: (await this.callContract(Loan.amountGathered)),
            isFundraising: (await this.callContract(Loan.isFundraising)),
            isPaidback: (await this.callContract(Loan.isPaidback)),
            isDefaulted: (await this.callContract(Loan.isDefaulted)),
        }
    }

    private async getLoanToken(): Promise<Web3.ContractInstance> {
        return this.connector.getContractInstance('PrintableToken', this.parameters.loanTokenAddress);
    }

    private async getCollateralToken(): Promise<Web3.ContractInstance> {
        return this.connector.getContractInstance('PrintableToken', this.parameters.loanTokenAddress);
    }

    /**
     * Gets the collateral amount that will be gathered for this loan when
     * `sendCollateral` gets called.
     *
     * @returns Value of Collateral token.
     */
    public async getCollateralAmount(): Promise<BigNumber> {
        let Token = await this.getCollateralToken();
        return this.callContract(Token.allowance, this.owner, this.address);
    }

    private async waitUntil(check: ()=>Promise<boolean>): Promise<void> {
        return new Promise<void>((resolve, reject)=>{
            let interval = setInterval(()=>{
                check().then((okay: boolean)=>{
                    if (okay) {
                        clearInterval(interval);
                        resolve();
                    }
                }).catch(reject);
            }, 1000);
        });
    }

    /**
     * Sets the collateral amount that will be gathered for this loan
     * when `sendCollateral` gets called.
     *
     * This function will block until the new collateral amount is saved on the
     * blockchain.
     *
     * @param amount Value of Collateral token.
     */
    public async setCollateralAmount(amount: BigNumber): Promise<void> {
        if (this.blockchainState.loanState != LoanState.CollateralCollection) {
            throw new Error("Loan is not gathering collateral anymore");
        }
        let coinbase = await this.connector.getCoinbase();
        if (!await this.isClientOwner()) {
            throw new Error("setCollateralAmount can only be called by owner of loan")
        }

        let Token = await this.getCollateralToken();
        await this.callContract(Token.approve, this.address.toLowerCase(), amount);

        return this.waitUntil(async ()=>{
            if ((await this.getCollateralAmount()).eq(amount)) {
                await this.updateStateFromBlockchain();
                return true;
            }
            return false;
        });
    }

    /**
     * Sends collateral to the loan and starts fundraising process. This is
     * non-reversible as it advances the state of the smart contract.
     *
     * This function will block until the new state is saved on the blockchain.
     *
     */
    public async sendCollateral(): Promise<void> {
        if (this.blockchainState.loanState != LoanState.CollateralCollection) {
            throw new Error("Loan is not gathering collateral anymore");
        }
        let Loan = await this.connector.getContractInstance('Loan', this.address);
        let res = await this.callContract(Loan.gatherCollateral);
        return this.waitUntil(async ()=>{
            await this.updateStateFromBlockchain();
            return this.blockchainState.isFundraising;
        });
    }

    /**
     * Returns whether the current API client is the owner/liege of the loan.
     *
     * @returns Whether the current API client is the owner/liege of the loan.
     */
    public async isClientOwner(): Promise<boolean> {
        let coinbase = await this.connector.getCoinbase();
        return (this.owner.toLowerCase() == coinbase.toLowerCase())
    }
    
    /**
     * Returns the balance of a given ERC20 token by the loan contract. This can be used
     * to check, for instance, how much collateral has been paid into a loan.
     *
     * @param token Address of ERC20 token for which to check the balance.
     * @returns Value of token owned by contract.
     */
    public async getBalance(token: string): Promise<BigNumber> {
        let Token = await this.connector.getContractInstance('PrintableToken', token);
        return this.callContract(Token.balanceOf, this.address);
    }
}


