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

See `src/example.ts`.

Building
--------

    yarn
    yarn build
