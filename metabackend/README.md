GetLine Metabackend
===================

The metabackend is a server-side system that stores a cache of data that's either impractical to include in the blockchain or with client-side code.

Clients communicate to it using gRPC or REST (planned?).

Contract source & ABI serving
-----------------------------

In order for client side libraries to be able to deploy and interact with loan contracts, they need access to the contract bytecode and ABI definitions. Instead of shipping it with the client library, we opted to have it served from the backend.

It currently parses a Truffle code checkout (for example the dapp/contracts directory) and serves the build/ bundles from there. In the future, it will deploy newer versions of the code and will be part of a larger CI/artifact versioning system, possibly also hosted on the blockchain.

Loan metadata cache
-------------------

Work in progress.

Building
========

System dependencies required:
    Go 1.9 or later (with $GOPATH/bin in $PATH)
    protoc (`apt install protobuf-compiler`)
    protoc-gen-go (`go get -u -v github.com/golang/protobuf/protoc-gen-go`)

To build:

    go get -u -d github.com/getline-network/getline/metabackend
    go generate github.com/getline-network/getline/metabackend/pb
    go install github.com/getline-network/getline/metabackend
    metabackend -help

Running
=======

    cd dapp/contracts
    metabackend -logtostderr

And to test:

    alias grpc="docker run --rm -it --net=host returnpath/grpc_cli"
    grpc call 127.0.0.1:2000 pb.Metabackend.GetDeployment 'network_id: "4"'

