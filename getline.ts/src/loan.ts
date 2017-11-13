import {BigNumber} from 'bignumber.js';
import * as moment from 'moment';

import * as pb from './generated/metabackend_pb';


export interface BlockToTime {
    (current: BigNumber, target: BigNumber): moment.Moment
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

    private blockToTime: BlockToTime
 
    constructor(proto: pb.LoanCache, currentBlock: BigNumber, blockToTime: BlockToTime) {
        this.blockToTime = blockToTime

        this.shortId = proto.getShortId();
        this.description = proto.getDescription();
        this.address = proto.getDeploymentAddress().getAscii();
        this.owner = proto.getOwner().getAscii();

        let params = proto.getParameters();
        this.parameters = {
            collateralTokenAddress: params.getCollateralToken().getAscii(),
            loanTokenAddress: params.getLoanToken().getAscii(),
            liegeAddress: params.getLiege().getAscii(),
            fundraisingDeadline: this.blockToTime(currentBlock, new BigNumber(params.getFundraisingBlocksCount())),
            paybackDeadline: this.blockToTime(currentBlock, new BigNumber(params.getPaybackBlocksCount()))
        };
    }
}


