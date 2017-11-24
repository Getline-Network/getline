import * as moment from 'moment';
import {BigNumber} from 'bignumber.js';

import { Client, Loan, LoanState } from './index';

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let main = async() => {
    let c = new Client("https://0.api.getline.in", "4");
    let user = await c.currentUser();
    console.log("user: " + user.ascii);

    const testToken = c.testToken;
    const balance = await testToken.humanize(await testToken.balanceOf(user));
    console.log(`${await testToken.name()} (${await testToken.symbol()}) balance: ${balance.toString()}`)
    if (balance.eq(0)) {
        const printValue = await testToken.humanize(await testToken.printValue())
        console.log(`Printing ${printValue.toString()} ${await testToken.symbol()}...`)
        await testToken.print(user)
        const newBalance = await testToken.humanize(await testToken.balanceOf(user));
        console.log(`${await testToken.name()} (${await testToken.symbol()}) balance: ${newBalance.toString()}`)
    }

    let loans = await c.loansByOwner(user);
    console.log(`${loans.length} loans:`);
    for (let i = 0; i < loans.length; i++) {
        const loan = loans[i];
        await loan.updateStateFromBlockchain();
        console.log("Loan " + loan.shortId);

        const {loanToken, interestPermil, paybackDeadline, fundraisingDeadline} = loan.parameters;
        const amountWanted = await loan.parameters.loanToken.humanize(loan.parameters.amountWanted);
        const symbol = await loanToken.symbol();
        const {loanState, amountGathered} = loan.blockchainState;

        console.log("  amount wanted:        " + amountWanted.toString() + " " + symbol);
        console.log("  interest     :        " + interestPermil / 10 + "%");
        console.log("  fundraising deadline: " + fundraisingDeadline.format());
        console.log("  payback deadline:     " + paybackDeadline.format());
        console.log("  state:                " + LoanState[loanState]);
        console.log("  gathered funds:       " + amountGathered.toString());

        if (loanState == LoanState.CollateralCollection) {
            console.log("  sending collateral...");
            await loan.sendCollateral(new BigNumber(100));
            console.log("  state:                " + LoanState[loan.blockchainState.loanState]);
        }

        console.log("\n");
    };

    let fundraising = moment().add(7, 'days');
    let payback = moment().add(1, 'month');
    let newLoan = await c.newLoan("test loan please ignore", new BigNumber(10000), 50, fundraising, payback);
    console.log("Created loan: " + newLoan.shortId);
}
main().catch((err)=>{
    console.log(err.stack);
});
