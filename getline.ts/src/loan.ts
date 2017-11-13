import {BigNumber} from 'bignumber.js';
import * as Web3 from 'web3';
import * as moment from 'moment';

import * as pb from './generated/metabackend_pb';


// Connector is a way for Loans to access blockchain data - this is provided
// by the instantiator of the Loan class.
export interface Connector {
    blockToTime(current: BigNumber, target: BigNumber): moment.Moment;
    getCurrentBlock(): Promise<BigNumber>;
    getContractInstance<T extends Web3.ContractInstance>(name: string, address: string): Promise<T>;
    getCoinbase(): Promise<string>;
}

export enum LoanState {
    CollateralCollection = 0,
    Fundraising,
    Payback,
    Finished
}

export class Loan {
    public parameters: {
        collateralTokenAddress: string
        loanTokenAddress: string
        liegeAddress: string
        fundraisingDeadline: moment.Moment
        paybackDeadline: moment.Moment
        amountWanted: BigNumber
    }
    public shortId: string
    public description: string
    public address: string
    public owner: string

    public blockchainState: {
        loanState: LoanState
        amountGathered: BigNumber
        isFundraising: boolean
        isPaidback: boolean
        isDefaulted: boolean
    }

    private connector: Connector

 
    constructor(connector: Connector) {
        this.connector = connector;
    }

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

    // Gets the collateral amount that will be gathered for this loan.
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

    // Allows the owner of the contract to change the collateral amount for this
    // loan. This method will async block until the new amount is accepted by the
    // blockchain.
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

    // Allows the owner to send the collateral to the loan. This method will
    // async block until the new state propagates to the blockchain.
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

    public async isClientOwner(): Promise<boolean> {
        let coinbase = await this.connector.getCoinbase();
        return (this.owner.toLowerCase() == coinbase.toLowerCase())
    }
    
    public async getBalance(token: string): Promise<BigNumber> {
        let Token = await this.connector.getContractInstance('PrintableToken', token);
        return this.callContract(Token.balanceOf, this.address);
    }
}


