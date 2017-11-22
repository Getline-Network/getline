[![getline build status](https://circleci.com/gh/Getline-Network/getline.png?style=shield&circle-token=a181947a77d90d0b98e50a37438d462beaabae1c "getline build status")](https://circleci.com/gh/Getline-Network/getline)

Getline Network
===============

This is the main repository for the Getline Distributed P2P Lending Platform. 

Public deployment
-----------------

For a work-in-progress webapp compatible with Metamask, see [demo.getline.in](https://demo.getline.in).

Additionally, if you're developing your own application we invite you to use our [0.api.getline.in/](https://0.api.getline.in/) metabackend endpoint for easy access to the latest and versioned smart contracts. Keep in mind that the service on port 443 is currently only a [gRPCWeb](https://github.com/improbable-eng/grpc-web)-compatible endpoint and might cause problems for normal gRPC 

This repository
---------------

We are currently under heavy development.

Structure is as follows:
  - `dapp/` - Solidity smart contracts for loans.
  - `frontend/` - Frontend webapp.
  - `metabackend/` - Loan metadata and bytecode cache server.
  - `getline.ts/` - Official client library in Typescript.
  - `pb/` - Protobuf definitions for the metabackend API.

We also have some supporting directories:
  - `vendor/` - vendorified dependencies, currently for the metabackend only
  - `production/` - Dockerfiles and Kubernetes description files for hosting the metabackend


API
---

We highly recommend using `getline.ts` for interacting with Getline from external code.

Otherwise, you are free to call smart contract methods and the metabackend via gRPCWeb.

Versioning
----------

**As Getline is currently in proof-of-concept phase on Rinkeby, we do not plan on keeping any stable API before a mainnet release.**

Once we reach version 1.0.0, we will provide API versioning at the following levels:

 - `getline.ts` - Forwards and backwards compatible API for all externel objects, semver major bump otherwise.
 - Smart contracts - Versioned by ABI, with all versions of smart contracts sources, bytecode and ABI definitions provided by the metabackend.
 - Protobufs - Forwards and backwards compatible wire format for all messages and RPC calls, semver major bump otherwise.

Development
-----------

All development and issue tracking happens on this repository. Pull requests are welcome, but keep in mind that this is a very fast moving codebase.

For dev chat, please join our [rocketchat](https://rocket.getline.in/) on #dev.
