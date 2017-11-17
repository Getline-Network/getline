import * as moment from 'moment';
import {BigNumber} from 'bignumber.js';

import { Client, Loan, LoanState } from './index';

let main = async() => {
    let c = new Client("https://0.api.getline.in", "4");
    let user = await c.currentUser();
    console.log("user: " + user.ascii);
    let loans = await c.loansByOwner(user);
    console.log(`${loans.length} loans:`);
    for (let i = 0; i < loans.length; i++) {
        let loan = loans[i];
        await loan.updateStateFromBlockchain();
        console.log("Loan " + loan.shortId);
        let amountWanted = await loan.parameters.loanToken.humanize(loan.parameters.amountWanted);
        let symbol = await loan.parameters.loanToken.symbol();
        console.log("  amount wanted:        " + amountWanted.toString() + " " + symbol);
        console.log("  fundraising deadline: " + loan.parameters.fundraisingDeadline.format());
        console.log("  payback deadline:     " + loan.parameters.paybackDeadline.format());
        console.log("  state:                " + LoanState[loan.blockchainState.loanState]);
        console.log("  gathered funds:       " + loan.blockchainState.amountGathered.toString());
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

