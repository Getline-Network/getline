Development quickstart
======================

    yarn
    yarn run truffle ...


Demo loan
---------

To create a set of demo tokens and a demo loan owned by yourself:

    yarn run create-demo-loan

This expects an RPC server on localhost:8545.

This will create two printable tokens, print some of them for your coinbase, and then create a loan owned by your coinbase. These can be useful if you want to play around with the loan contract on Rinkeby or another test network.
