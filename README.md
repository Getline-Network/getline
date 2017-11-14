[![getline build status](https://circleci.com/gh/Getline-Network/getline.png?style=shield&circle-token=a181947a77d90d0b98e50a37438d462beaabae1c "getline build status")](https://circleci.com/gh/Getline-Network/getline)

Getline Network
===============

This is the main repository for the Getline Distributed P2P Lending Platform.

We are currently under heavy development.

Structure is as follows:
  - `dapp/` - Solidity smart contracts for loans.
  - `frontend/` - Frontend library and client.
  - `metabackend/` - Loan metadata and bytecode cache server.
  - `pb/` - Protobuf definitions for the metabackend API.

We also have some supporting directories:
  - `vendor/` - vendorified dependencies, currently for the metabackend only
  - `production/` - Dockerfiles and Kubernetes description files for hosting the metabackend
