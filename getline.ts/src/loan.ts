import {BigNumber} from 'bignumber.js';
import * as moment from 'moment';

import * as pb from './generated/metabackend_pb';


// Connector is a way for Loans to access blockchain data - this is provided
// by the instantiator of the Loan class.
export interface Connector {
    blockToTime(current: BigNumber, target: BigNumber): moment.Moment;
    getCurrentBlock(): Promise<BigNumber>
}

export class Loan {
    public parameters: {
        collateralTokenAddress: string
        loanTokenAddress: string
        liegeAddress: string
        fundraisingDeadline: moment.Moment
        paybackDeadline: moment.Moment
    }
    public shortId: string
    public description: string
    public address: string
    public owner: string

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
            paybackDeadline: blockToTime(params.getPaybackBlocksCount())
        };
    }
}


