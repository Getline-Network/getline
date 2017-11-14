[![getline build status](https://circleci.com/gh/Getline-Network/getline.png?style=shield&circle-token=a181947a77d90d0b98e50a37438d462beaabae1c "getline build status")](https://circleci.com/gh/Getline-Network/getline)

Getline Network
===============

This is the main repository for the Getline Distributed P2P Lending Platform. 

Web interface
-------------

For a work-in-progress webapp compatible with Metamask, see [https://demo.getline.in](demo.getline.in).

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

**As Getline is currently in proof-of-concept phase, we do not plan on keeping any stable API.**

Once we reach version 1.0.0, we will provide API versioning at the following levels:

 - `getline.ts` - Forwards and backwards compatible API for all externel objects, semver major bump otherwise.
 - Smart contracts - Versioned by ABI, with all versions of smart contracts sources, bytecode and ABI definitions provided by the metabackend.
 - Protobufs - Forwards and backwards compatible wire format for all messages and RPC calls, semver major bump otherwise.
