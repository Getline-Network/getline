import {BigNumber} from "bignumber.js";
import * as debug from "debug";
import * as moment from "moment";
import * as Web3 from "web3";

import {Blockchain, Contract} from "./blockchain";
import {Address, Token, waitUntil} from "./common";
import * as pb from "./generated/metabackend_pb";

const logger = debug("getline.ts:loan");

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
     * Loan has been paid back by borrower and there might be funds to be
     * transfered back to their respective owners.
     */
    Paidback,
    /**
     * Loan has defaulted and there might be funds to be transfered back to
     * their respective owners.
     */
    Defaulted,
    /**
     * Loan has been canceled and there might be funds to be transfered back to
     * their respective owners.
     */
    Canceled,
}

/**
 * Withdrawal possibilities, with their comments showing sample explanations.
 */
export enum WithdrawalReason {
    /**
     * You are entitled to get tokens from this loan.
     */
    Unknown = 0,
    /**
     * You have paid back this loan, which entitles you to get the collateral
     * back.
     */
    CollateralBackAfterPayback,
    /**
     * You have invested in this loan, which entitles you to get your invesment
     * back with interest.
     */
    LoanBackAfterPayback,
    /**
     * The loan has not raised funds on time, but you can get your collateral
     * back.
     */
    CollateralBackAfterCanceled,
    /**
     * The loan has not raised funds on time, so you can withdraw your
     * investment back.
     */
    LoanBackAfterCanceled,
    /**
     * The loan has defaulted, but you're entitled to your share of the
     * collateral.
     */
    CollateralBackAfterDefaulted,
}

/**
 * Possible withdrawals from a loan.
 */
export interface Withdrawal {
    /**
     * Token that can be withdrawn.
     */
    token: Token;
    /**
     * Amount that can be withdrawn.
     */
    amount: BigNumber;
    /**
     * Reason for this withdrawal.
     */
    reason: WithdrawalReason;
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
         * Number of seconds between gathering collateral and fundraising
         * deadline.
         */
        fundraisingDelta: number,
        /**
         * Number of seconds between fundraising and payback being required.
         */
        paybackDelta: number,
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
        amountInvested: BigNumber,
        /**
         * Value of the collateral token received as collateral.
         */
        collateralReceived: BigNumber,
        /**
         * Date by which the loan needs to have all investment gathered.
         */
        fundraisingDeadline: moment.Moment,
        /**
         * Date by which loan needs to be fully repaid.
         */
        paybackDeadline: moment.Moment,
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

        const params = proto.getParameters()!;
        this.parameters = {
            amountWanted: new BigNumber(params.getAmountWanted()),
            collateralToken: new Token(this.blockchain, params.getCollateralToken()!.getAscii()),
            fundraisingDelta: params.getFundraisingDelta(),
            interestPermil: params.getInterestPermil(),
            loanToken: new Token(this.blockchain, params.getLoanToken()!.getAscii()),
            paybackDelta: params.getPaybackDelta(),
        };

        this.contract = await this.blockchain.existing("Loan", this.address);
    }

    /**
     * Loads the newest state of the loan from the blockchain.
     */
    public async updateStateFromBlockchain(): Promise<void> {
        logger("Loan.updateStateFromBlockchain() starting...");
        this.blockchainState = {
            amountInvested: await this.contract.call<BigNumber>("totalAmountInvested"),
            collateralReceived: await this.contract.call<BigNumber>("receivedCollateral"),
            fundraisingDeadline: moment.unix(await this.contract.call<number>("fundraisingDeadline")),
            loanState: (await this.contract.call<BigNumber>("state")).toNumber(),
            paybackDeadline: moment.unix(await this.contract.call<number>("paybackDeadline")),
        };

        logger("Loan.updateStateFromBlockchain() done.");
    }

    /**
     * Sends collateral to the loan and starts fundraising process. This is
     * non-reversible as it advances the state of the smart contract.
     *
     * This function will block until the new state is saved on the blockchain.
     *
     */
    public async sendCollateral(amount: BigNumber): Promise<void> {
        logger(`Loan.sendCollateral(${amount.toNumber()}) starting...`);
        if (this.blockchainState === undefined) {
            await this.updateStateFromBlockchain();
        }

        if (this.blockchainState.loanState !== LoanState.CollateralCollection) {
            throw new Error("Loan is not gathering collateral anymore");
        }
        if (!await this.isOwner()) {
            throw new Error("sendCollateral can only be called by owner of loan");
        }

        // First, ensure that collateral allowance is set correctly.
        const collateral = this.parameters.collateralToken;
        await collateral.approve(this.address, amount);
        await this.updateStateFromBlockchain();

        // Now, call gatherCollateral and wait for state change.
        await this.contract.mutate("gatherCollateral");
        await this.updateStateFromBlockchain();
        logger(`Loan.sendCollateral(${amount.toNumber()}) done.`);
    }

    /**
     * Sends investment to the loan.
     *
     * This function will block until the new state is saved on the blockchain.
     *
     */
    public async invest(amount: BigNumber): Promise<void> {
        logger(`Loan.invest(${amount.toNumber()}) starting...`);
        if (this.blockchainState === undefined) {
            await this.updateStateFromBlockchain();
        }

        if (this.blockchainState.loanState !== LoanState.Fundraising) {
            throw new Error("Loan is not currently fundraising");
        }

        // First, ensure that loan allowance is set correctly.
        const loan = this.parameters.loanToken;
        await loan.approve(this.address, amount);
        await this.updateStateFromBlockchain();

        // Now, call invest and wait for state change.
        await this.contract.mutate("invest");
        await this.updateStateFromBlockchain();
        logger(`Loan.invest(${amount.toNumber()}) done.`);
    }

    /**
     * Returns the payback amount required for the loan, in loan token units.
     */
    public async paybackRequired(): Promise<BigNumber> {
        if (this.blockchainState === undefined) {
            await this.updateStateFromBlockchain();
        }
        return this.contract.call<BigNumber>("paybackRequired");
    }

    /**
     * Pays back the loan.
     *
     * This function will block until the new state is saved on the blockchain.
     *
     */
    public async payback(): Promise<void> {
        logger("Loan.payback() starting...");
        if (this.blockchainState === undefined) {
            await this.updateStateFromBlockchain();
        }

        if (this.blockchainState.loanState !== LoanState.Payback) {
            throw new Error("Loan is not currently fundraising");
        }

        const amount = await this.paybackRequired();

        // First, ensure that payback allowance is set correctly.
        const loan = this.parameters.loanToken;
        await loan.approve(this.address, amount);
        await this.updateStateFromBlockchain();

        // Now, call invest and wait for state change.
        await this.contract.mutate("payback");
        await this.updateStateFromBlockchain();
        logger("Loan.payback() done.");
    }

    /**
     * Returns possible withdrawals for a given loan depending on the caller.
     */
    public async possibleWithdrawals(): Promise<Withdrawal[]> {
        const [loanAmount, collateralAmount] = await this.contract.call<BigNumber[]>("withdrawable");

        const state = this.blockchainState.loanState;

        const result: Withdrawal[] = [];

        if (collateralAmount.gt(0)) {
            let collateralReason = WithdrawalReason.Unknown;
            if (state === LoanState.Paidback) {
                collateralReason = WithdrawalReason.CollateralBackAfterPayback;
            } else if (state === LoanState.Defaulted) {
                collateralReason = WithdrawalReason.CollateralBackAfterDefaulted;
            } else if (state === LoanState.Canceled) {
                collateralReason = WithdrawalReason.CollateralBackAfterCanceled;
            }
            result.push({
                amount: collateralAmount,
                reason: collateralReason,
                token: this.parameters.collateralToken,
            });
        }
        if (loanAmount.gt(0)) {
            let loanReason = WithdrawalReason.Unknown;
            if (state === LoanState.Paidback) {
                loanReason = WithdrawalReason.LoanBackAfterPayback;
            } else if (state === LoanState.Canceled) {
                loanReason = WithdrawalReason.LoanBackAfterCanceled;
            }
            result.push({
                amount: loanAmount,
                reason: loanReason,
                token: this.parameters.loanToken,
            });
        }

        return result;
    }

    /**
     * Withdraw all available funds from a loan.
     */
    public async withdrawAll(): Promise<void> {
        let [prevLoan, prevCollateral] = [new BigNumber(0), new BigNumber(0)];

        // Continue withdrawing until no change happens in what we can withdraw.
        while (true) {
            const amounts = await this.contract.call<BigNumber[]>("withdrawable");
            const [loan, collateral] = amounts;
            if (loan.eq(prevLoan) && collateral.eq(prevCollateral)) {
                break;
            }
            [prevLoan, prevCollateral] = [loan, collateral];

            await this.contract.mutate("withdraw");
        }
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
