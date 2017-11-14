Getline Typescript Client Library
=================================

Introduction
------------

This library lets you view and manage Getline.in loans programatically.
It runs under node.js and in Chrome with the Metamask extension. You will
be automatically logged in as the first address from your web3 provider.

The library is fully async/await compatible, which means you can use it
both with `Promise.then/.catch` and `await` blocks. All calls that interact
with the blockchain will block until the result propagates.

Currently this library **only allows you to create loans on the Rinkeby
testnet** - this is by design until we go out of demo.

Documentation
-------------

Documentation is available in the `doc/` directory or [online](https://getline-network.github.io/getline/getline.ts/doc/);


Sample usage
------------

    import { Client, Loan, LoanState } from 'getline.ts';
    let main = async() => {
        let c = new Client("https://0.api.getline.in", "4");
        let loans = await c.getLoansByOwner(await c.getCoinbase());
        console.log("My loans:");
        loans.forEach(async (loan: Loan)=>{
            await loan.updateStateFromBlockchain();
            console.log("Loan " + loan.shortId);
            console.log("  fundraising deadline: " + loan.parameters.fundraisingDeadline.format());
            console.log("  payback deadline:     " + loan.parameters.paybackDeadline.format());
            console.log("  state:                " + LoanState[loan.blockchainState.loanState]);
            console.log("  gathered funds:       " + loan.blockchainState.amountGathered.toString());
            console.log("\n");
        });
    }
    main().catch((err)=>{
        console.log(err.stack);
    });

