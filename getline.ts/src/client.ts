import {BigNumber} from 'bignumber.js';
import * as moment from 'moment';
import * as Web3 from 'web3';

import {MetabackendClient, MetabackendService, pb} from './metabackend';
import {GetlineBlockchain, Blockchain} from './blockchain';
import {Loan} from './loan';
import {Address, PrintableToken, LOAN_CONTRACT} from './common';

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
    private blockchain: GetlineBlockchain;
    private initialized: boolean;

    /**
     * Token that is used for collateral and loans in the demo.
     */
    public readonly testToken: PrintableToken;

    /**
     * Creates a new Getline client.
     * The .initialize() method must be called before first use.
     *
     * @param metabackend Address of metabackend. Production address is
     *                    `https://0.api.getline.in`.
     * @param network Network identifier. Currently only `"4"` (Rinkeby) is
     *                supported.
     * @param provider Web3 provider to use. If not given, the client will try
     *                 to find an injected one from Metamask. Otherwise, it
     *                 will fall back to http://localhost:8545/.
     * @param debug Whether to enable verbose debugging to console. Default is
     *              false.
     */
    constructor(metabackend: string, network: string, provider?: Web3.Provider, debug?: boolean) {
        this.metabackend = new MetabackendClient(metabackend, network, debug);
        this.network = network;
        this.blockchain = new GetlineBlockchain(this.metabackend, network, provider, debug);
        this.testToken = new PrintableToken(this.blockchain, "0x02c9ccaa1034a64e3a83df9ddce30e6d4bc40515");
        this.initialized = false;
    }

    /**
     * Initialize the API client and connect to the blockchain.
     * This must be called before any other method.
     */
    public async initialize(): Promise<void> {
        if (this.initialized) {
            console.error("getline.ts client was initialized twice - ignoring.");
            return;
        }
        await this.blockchain.initialize();
        this.initialized = true;
    }
    
    // TODO(q3k): Remove this after demo, require explicit initialization instead.
    private async initializeIfNeeded(): Promise<void> {
        if (this.initialized) {
            return;
        }
        console.error("getline.ts client was not explicitely initialized - this will be deprecated in the future");
        return this.initialize();
    }


    public async currentUser(): Promise<Address> {
        await this.initializeIfNeeded();

        return this.blockchain.coinbase();
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
    public async newLoan(description: string, amount: BigNumber, interestPermil: number,
                         fundraisingEnd: moment.Moment, paybackEnd: moment.Moment): Promise<Loan> {
        await this.initializeIfNeeded();

        // TODO(q3k) change this when we're not on rinkeby and we have a better loan SC
        if (this.network != "4") {
            throw new Error("cannot place loan on non-rinkeby chains");
        }

        let now = moment();
        if (fundraisingEnd.isBefore(now)) {
            throw new Error("cannot place loan with fundraising deadline in the past");
        }
        if (paybackEnd.isBefore(now)) {
            throw new Error("cannot place loan with payback deadline in the past");
        }
        if (paybackEnd.isBefore(fundraisingEnd)) {
            throw new Error("cannot place loan with payback deadline before fundraising deadline");
        }

        const currentBlock = (await this.blockchain.currentBlock()).toNumber();
        const blocksPerSecond = (1.0) / 15;

        const fundraisingDelta = fundraisingEnd.diff(now, 'seconds');
        const paybackDelta = paybackEnd.diff(now, 'seconds');
        const fundraisingEndBlocks = currentBlock + blocksPerSecond * fundraisingDelta;
        const paybackEndBlocks = currentBlock + blocksPerSecond * paybackDelta;

        const loan = await this.blockchain.deploy(LOAN_CONTRACT,
            this.testToken.ascii, this.testToken.ascii,
            (await this.currentUser()).ascii,
            amount, interestPermil, fundraisingEndBlocks, paybackEndBlocks);

        let req = new pb.IndexLoanRequest();
        req.setNetworkId(this.network);
        req.setDescription(description);
        req.setLoan(loan.address.proto());

        let res = await this.metabackend.invoke(MetabackendService.IndexLoan, req);
        return this.loan(res.getShortId());
    }

    /**
     * Returns loan identifier by a given short identifier.
     *
     * @param shortId Short identifier of loan (`shortId` member of a `Loan`
     *                object).
     * @returns Loan identifier by shortId.
     */
    public async loan(shortId: string): Promise<Loan> {
        await this.initializeIfNeeded();

        let req = new pb.GetLoansRequest();
        req.setNetworkId(this.network);
        req.setShortId(shortId);

        let res = await this.metabackend.invoke(MetabackendService.GetLoans, req);
        if (res.getNetworkId() != this.network) {
            throw new Error("Invalid network ID in response.");
        }

        let loan = new Loan(this.blockchain);
        await loan.loadFromProto(res.getLoanCacheList()[0]);
        return loan;
    }

    /**
     * Returns all loans owned by a given address, regardless of their state.
     *
     * @param owner Ethereum address of owner/liege.
     * @returns Loans owned by `owner`.
     */
    public async loansByOwner(owner: Address): Promise<Array<Loan>> {
        await this.initializeIfNeeded();

        let req = new pb.GetLoansRequest();
        req.setNetworkId(this.network);
        req.setOwner(owner.proto());

        let res = await this.metabackend.invoke(MetabackendService.GetLoans, req);
        if (res.getNetworkId() != this.network) {
            throw new Error("Invalid network ID in response.");
        }

        let loans : Array<Loan> = [];
        let promises : Array<Promise<void>> = [];
        let currentBlock = await this.blockchain.currentBlock();
        res.getLoanCacheList().forEach((elem) => {
            let loan = new Loan(this.blockchain);
            promises.push(loan.loadFromProto(elem));
            loans.push(loan);
        });
        await Promise.all(promises);
        return loans;
    }
}
