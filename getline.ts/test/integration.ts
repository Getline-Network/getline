import { suite, test, slow, timeout } from "mocha-typescript";
import { assert, use as chaiUse } from 'chai';
import chaiAsPromised = require('chai-as-promised');
import * as sinon from 'sinon';

import * as Web3 from 'web3';
import { Client, Loan, LoanState } from '../src/index';
import { BigNumber } from 'bignumber.js';
import * as moment from 'moment';


chaiUse(chaiAsPromised);

const metabackendUrl = 'http://metabackend:2080';
const ganacheUrl = 'http://ganache:8545';

@suite(timeout(15000), slow(5000))
class EndToEndTests {
    provider = new Web3.providers.HttpProvider(ganacheUrl);

    private client: Client | undefined

    /**
     * Create a client with an injected test token.
     */
    async createClient(): Promise<Client> {
        if (this.client != undefined) {
            return this.client;
        }
        let client: any = new Client(metabackendUrl, "4", this.provider);
        await client.initialize();
        let token = await client.blockchain.deploy("PrintableToken", "Integration Testcoin", 2, "ITC", 10000);
        client.testToken = token.address.token().printable();
        this.client = client;
        return client;
    }

    /**
     * Create a sample loan for testing.
     */
    async createSampleLoan(client: Client): Promise<Loan> {
        const description = "test loan";
        const amount = new BigNumber(1000);
        const interestPermil = 50;
        const fundraising = 7 * 86400;
        const payback = 7 * 86400;
        return client.newLoan(description, amount, interestPermil, fundraising, payback);
    }


    /**
     * Checks if the client exports a valid user.
     */
    @test async activeUser() {
        const c = await this.createClient();
        const user = await c.currentUser();
        const w3 = new Web3(this.provider);
        assert(user.ascii == w3.eth.accounts[0], "account is returned correctly");
    }


    /**
     * Checks if the client can succesfully add a loan.
     */
    @test async addLoan() {
        const c = await this.createClient();
        const description = "test loan";
        const amount = new BigNumber(1000);
        const interestPermil = 50;
        const fundraising = 7 * 86400;
        const payback = 7 * 86400;
        const loan = await c.newLoan(description, amount, interestPermil, fundraising, payback);

        // Parameters from user in metabackend.
        assert(loan.description == description, "description set correctly");
        assert(loan.shortId.length > 0, "shortId generated correctly");
        assert(loan.address.ascii.length > 0, "address generated correctly");
        assert(loan.owner.eq(await c.currentUser()), "owner set correctly")

        // Parameters from user on the blockchain.
        assert(loan.parameters.fundraisingDelta == fundraising, "fundraising set correctly");
        assert(loan.parameters.paybackDelta == payback, "payback set correctly");
        assert(loan.parameters.amountWanted.eq(amount), "amount wanted set correctly");
        assert(loan.parameters.interestPermil == interestPermil, "interest set correctly");

        // State on the blockchain.
        await loan.updateStateFromBlockchain();
        assert(loan.blockchainState.loanState == LoanState.CollateralCollection, "loan state set correctly");
        assert(loan.blockchainState.amountInvested.eq(0), "amount gathered zero");
    }

    /**
     * Checks if the user can print some colletaral.
     */
    @test async demoPrintCollateral() {
        const c = await this.createClient();
        const token = c.testToken;
        const user = await c.currentUser();

        const balanceStart = await token.balanceOf(user);
        await token.print(user);
        const balanceEnd = await token.balanceOf(user);
        assert(balanceEnd.gt(balanceStart), "balance is greater after printing");
    }

    /**
     * Checks if the user can send a collateral to their loan.
     */
    @test(timeout(30000), slow(15000)) async gatherLoanCollateral() {
        const c = await this.createClient();
        const loan = await this.createSampleLoan(c);
        const user = await c.currentUser();

        // Send loan when not able to afford it.
        await assert.isRejected(loan.sendCollateral(new BigNumber(5000)));
        await loan.updateStateFromBlockchain();
        assert(loan.blockchainState.loanState == LoanState.CollateralCollection, "loan state hasn't changed");

        // Print some money, then send the collateral.
        await c.testToken.print(user);
        await loan.sendCollateral(new BigNumber(5000));
        assert(loan.blockchainState.loanState == LoanState.Fundraising, "loan state is fundraising");
    }

    /**
     * Checks if the user can invest in a loan.
     */
    @test(timeout(50000), slow(25000)) async loanInvest() {
        const c = await this.createClient();
        const loan = await this.createSampleLoan(c);
        const user = await c.currentUser();

        // Print some money.
        await c.testToken.print(user);

        // Make note of how much money we have.
        const amountStart = await c.testToken.balanceOf(user);

        // Send collateral and check if we are fundraising.
        await loan.sendCollateral(new BigNumber(5000));
        assert(loan.blockchainState.loanState == LoanState.Fundraising, "loan state is fundraising");

        let balance = await c.testToken.balanceOf(user);
        let want = amountStart.sub(5000);
        assert(balance.eq(want), `after sending collateral user has ${balance}, should have ${want}`);

        // Send investment.
        await loan.invest(new BigNumber(500));
        assert(loan.blockchainState.loanState == LoanState.Fundraising, "loan state is fundraising");
        assert(loan.blockchainState.amountInvested.eq(500), "loan has gathered right amount of funds");

        balance = await c.testToken.balanceOf(user);
        want = amountStart.sub(5500);
        assert(balance.eq(want), `after sending investment user has ${balance}, should have ${want}`);

        // Finish investment.
        await loan.invest(new BigNumber(500));
        assert(loan.blockchainState.loanState == LoanState.Payback, "loan state is in payback");

        balance = await c.testToken.balanceOf(user);
        want = amountStart.sub(5000); // Start amount without collateral - after finishing the investment
                                      // the user immediately receives the loan.
        assert(balance.eq(want), `after finishing investment user has ${balance}, should have ${want}`);

        // Now pay the loan back.
        await loan.payback();
        assert(loan.blockchainState.loanState == LoanState.Paidback, "loan state is paidback");

        // Withdraw everything. Amount of tokens should match start.
        await loan.withdrawAll();
        assert((await c.testToken.balanceOf(user)).eq(amountStart), "amount of tokens owner by user must match initial amount");

    }

    @test(timeout(50000), slow(25000)) async loanInvestIndex() {
        const c = await this.createClient();
        const loan = await this.createSampleLoan(c);
        const user = await c.currentUser();

        await c.testToken.print(user);
        await loan.sendCollateral(new BigNumber(5000));

        let loansInvested = await c.loansByInvestor(user);
        for (const l of loansInvested) {
            assert(!l.address.eq(loan.address), "newly created loan found in invested-by data");
        }

        await loan.invest(new BigNumber(1000));

        loansInvested = await c.loansByInvestor(user);
        let found = false;
        for (const l of loansInvested) {
            if (l.address.eq(loan.address)) {
                found = true;
                break;
            }
        }
        assert(found, "loan not found in invested-by data");
    }


    /**
     * Checks if a loan is indexed correctly.
     */
    @test(timeout(30000), slow(15000)) async loanIndexSimple() {
        const c = await this.createClient();
        const user = await c.currentUser();

        // Assume loan count baseline from first call.
        let loans = await c.loansByOwner(user);
        const loanCount = loans.length;

        // Create the first loan.
        const loan1 = await this.createSampleLoan(c);
        // Check if loan can be retrieved by ID.
        const loan1_ = await c.loan(loan1.shortId);
        assert(loan1.address.eq(loan1_.address), "returned loan is the same loan");

        // Check if loan is present in loan user list.
        loans = await c.loansByOwner(user);
        assert(loans.length == loanCount + 1, "one new loan is owned by user")
        let addresses = loans.map((l: Loan): string => l.address.ascii);
        assert(addresses.includes(loan1.address.ascii), "newly added loan is present");

        // Add another loan.
        const loan2 = await this.createSampleLoan(c);
        // Check if loan can be retrieved by ID.
        const loan2_ = await c.loan(loan2.shortId);
        assert(loan2.address.eq(loan2_.address), "returned loan is the same loan");

        // Check if the two loans are present.
        loans = await c.loansByOwner(user);
        assert(loans.length == loanCount + 2, "two new loans are owned by user")
        addresses = loans.map((l: Loan): string => l.address.ascii);
        assert(addresses.includes(loan1.address.ascii), "first loan is present");
        assert(addresses.includes(loan2.address.ascii), "second loan is present");
    }

    private async addressesByState(c: Client): Promise<{ [id: number]: string[] }> {
        const states: LoanState[] = [
            LoanState.CollateralCollection,
            LoanState.Fundraising,
            LoanState.Payback,
            LoanState.Canceled,
            LoanState.Defaulted,
            LoanState.Paidback,
        ];
        const res: { [id: number]: string[] } = {}
        for (const state of states) {
            const loans = await c.loansByState(state);
            res[state] = loans.map((l: Loan): string => l.address.ascii);
        }
        return res;
    }

    /**
     * Checks if a loans are correctly returned when their state changes.
     */
    @test(timeout(60000), slow(15000)) async loanIndexByState() {
        const c = await this.createClient();
        const user = await c.currentUser();

        // Create a bunch of test loans.
        const loans: Loan[] = [];
        const promises: Array<Promise<void>> = [];
        for (let i = 0; i < 4; i++) {
            const promise = this.createSampleLoan(c).then(async (l: Loan): Promise<void> => {
                loans.push(l);
            });
            promises.push(promise);
        }
        await Promise.all(promises);

        let loansByState = await this.addressesByState(c);
        for (const loan of loans) {
            const a = loan.address.ascii
            assert(loansByState[LoanState.CollateralCollection].includes(a), "new loan in collateral collection");
            assert(!loansByState[LoanState.Fundraising].includes(a), "new loan not in fundraising");
            assert(!loansByState[LoanState.Payback].includes(a), "new loan not in payback");
            assert(!loansByState[LoanState.Paidback].includes(a), "new loan not in paidback");
            assert(!loansByState[LoanState.Canceled].includes(a), "new loan not in canceled");
            assert(!loansByState[LoanState.Defaulted].includes(a), "new loan not in defaulted");
        }

        // Print some money, then send the collateral.
        await c.testToken.print(user);
        await loans[2].sendCollateral(new BigNumber(5000));
        loansByState = await this.addressesByState(c);
        for (const loan of loans) {
            const a = loan.address.ascii
            if (loan === loans[2]) {
                assert(!loansByState[LoanState.CollateralCollection].includes(a), "changed loan not in collection");
                assert(loansByState[LoanState.Fundraising].includes(a), "changed loan in fundraising");
                assert(!loansByState[LoanState.Payback].includes(a), "changed loan not in payback");
                assert(!loansByState[LoanState.Paidback].includes(a), "changed loan not in paidback");
                assert(!loansByState[LoanState.Canceled].includes(a), "changed loan not in canceled");
                assert(!loansByState[LoanState.Defaulted].includes(a), "changed loan not in defaulted");
            } else {
                assert(loansByState[LoanState.CollateralCollection].includes(a), "unchanged loan in collection");
                assert(!loansByState[LoanState.Fundraising].includes(a), "unchanged loan not in fundraising");
                assert(!loansByState[LoanState.Payback].includes(a), "unchanged loan not in payback");
                assert(!loansByState[LoanState.Paidback].includes(a), "uchanged loan not in paidback");
                assert(!loansByState[LoanState.Canceled].includes(a), "uchanged loan not in canceled");
                assert(!loansByState[LoanState.Defaulted].includes(a), "uchanged loan not in defaulted");
            }
        }
    }

    /**
     * Checks if a loan is correctly rejected if invalid.
     */
    @test(timeout(30000), slow(15000)) async loanIndexRejectInvalid() {
        const c = await this.createClient();
        const user = await c.currentUser();

        const description = "test loan";
        const amount = new BigNumber(0);
        const interestPermil = 50;
        const fundraising = 7 * 86400;
        const payback = 7 * 86400;

        assert.isRejected(c.newLoan(description, amount, interestPermil, fundraising, payback), /non-positive amount/, "zero amount loan is rejected");
    }
}
