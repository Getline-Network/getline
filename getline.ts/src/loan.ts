import {BigNumber} from "bignumber.js";
import * as moment from "moment";
import * as Web3 from "web3";

import {Blockchain, Contract} from "./blockchain";
import {Address, Token, waitUntil} from "./common";
import * as pb from "./generated/metabackend_pb";

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
    Finished,
}

/**
 * Representation of a GetLine Loan indexed by the system and running on the
 * blockchain.
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
        collateralToken: Token,
        /**
         * Address of ERC20-compatible token used as loan.
         */
        loanToken: Token,
        /**
         * Date by which the loan needs to have all investment gathered.
         */
        fundraisingDeadline: moment.Moment,
        /**
         * Date by which loan needs to be fully repaid.
         */
        paybackDeadline: moment.Moment,
        /**
         * Amount of loan token wanted.
         */
        amountWanted: BigNumber,
        /**
         * Interest of loan, in permil.
         */
        interestPermil: number,
    };
    /**
     * A short identifier that is used to lookup the loan in the Getline
     * index system (metabackend). Opaque.
     */
    public shortId: string;
    /**
     * User-given description of the loan.
     */
    public description: string;
    /**
     * Ethereum address at which loan is deployed.
     */
    public address: Address;
    /**
     * Ethereum address of owner/liege of loan.
     */
    public owner: Address;

    /**
     * State of the loan on the blockchain. These change with time.
     * `updateStateFromBlockchain` should be called to update this data with the
     * freshest state from the blockchain.
     */
    public blockchainState: {
        /**
         * State of Loan contract.
         */
        loanState: LoanState,
        /**
         * Value of loan token gathered in fundraising.
         */
        amountGathered: BigNumber,
        /**
         * Whether the loan is currently raising funds from investors.
         */
        fundraising: boolean,
        /**
         * Whether the loan has been paid back succesfully.
         */
        paidback: boolean,
        /**
         * Whether the loan has defaulted, ie. the liege has not paid back in
         * time.
         */
        defaulted: boolean,
    };

    private blockchain: Blockchain;

    private contract: Contract;

    /**
     * Private constructor used by the library.
     */
    constructor(blockchain: Blockchain) {
        this.blockchain = blockchain;
    }

    /**
     * Private method used by the library to load data from a metabackend
     * protobuf.
     */
    public async loadFromProto(proto: pb.LoanCache) {
        this.shortId = proto.getShortId();
        this.description = proto.getDescription();

        if (!proto.hasDeploymentAddress()) { throw new Error("invalid proto: missing deployment address"); }
        if (!proto.hasOwner()) { throw new Error("invalid proto: missing deployment address"); }
        if (!proto.hasParameters()) { throw new Error("invalid proto: missing parameters"); }
        if (!proto.getParameters()!.hasCollateralToken()) {
            throw new Error("invalid proto: missing collateral token");
        }
        if (!proto.getParameters()!.hasLoanToken()) { throw new Error("invalid proto: missing loan token"); }

        this.address = new Address(this.blockchain, proto.getDeploymentAddress()!.getAscii());
        this.owner = new Address(this.blockchain, proto.getOwner()!.getAscii());

        const currentBlock = await this.blockchain.currentBlock();
        const blockToTime = (count: string) => {
            return this.blockchain.blockToTime(currentBlock, new BigNumber(count));
        };

        const params = proto.getParameters()!;
        this.parameters = {
            amountWanted: new BigNumber(params.getAmountWanted()),
            collateralToken: new Token(this.blockchain, params.getCollateralToken()!.getAscii()),
            fundraisingDeadline: blockToTime(params.getFundraisingBlocksCount()),
            interestPermil: params.getInterestPermil(),
            loanToken: new Token(this.blockchain, params.getLoanToken()!.getAscii()),
            paybackDeadline: blockToTime(params.getPaybackBlocksCount()),
        };

        this.contract = await this.blockchain.existing("Loan", this.address);
    }

    /**
     * Loads the newest state of the loan from the blockchain.
     */
    public async updateStateFromBlockchain(): Promise<void> {
        this.blockchainState = {
            amountGathered: await this.contract.call<BigNumber>("amountGathered"),
            defaulted: await this.contract.call<boolean>("isDefaulted"),
            fundraising: await this.contract.call<boolean>("isFundraising"),
            loanState: (await this.contract.call<BigNumber>("currentState")).toNumber(),
            paidback: await this.contract.call<boolean>("isPaidback"),
        };
    }

    /**
     * Sends collateral to the loan and starts fundraising process. This is
     * non-reversible as it advances the state of the smart contract.
     *
     * This function will block until the new state is saved on the blockchain.
     *
     */
    public async sendCollateral(amount: BigNumber): Promise<void> {
        if (this.blockchainState === undefined) {
            await this.updateStateFromBlockchain();
        }

        if (this.blockchainState.loanState !== LoanState.CollateralCollection) {
            throw new Error("Loan is not gathering collateral anymore");
        }
        if (!await this.isOwner()) {
            throw new Error("setCollateralAmount can only be called by owner of loan");
        }

        // First, ensure that collateral allowance is set correctly.
        const collateral = this.parameters.collateralToken;
        await collateral.approve(this.address, amount);
        await this.updateStateFromBlockchain();

        // Now, call gatherCollateral and wait for state change.
        await this.contract.mutate("gatherCollateral");
        await this.updateStateFromBlockchain();
    }

    /**
     * Returns whether the current API client is the owner/liege of the loan.
     *
     * @returns Whether the current API client is the owner/liege of the loan.
     */
    public async isOwner(): Promise<boolean> {
        const coinbase = await this.blockchain.coinbase();
        return this.owner.eq(coinbase);
    }
}
