import * as jspb from 'google-protobuf';
import * as Web3 from 'web3';
import * as encoding from 'text-encoding';
import * as IsNode from 'is-node';
import {Mutex, MutexInterface} from 'async-mutex';

import {Metabackend as MetabackendService} from './generated/metabackend_pb_service';
import * as pb from "./generated/metabackend_pb";

import {grpc, Code, Metadata, Transport} from 'grpc-web-client';
import nodeHttpRequest from 'grpc-web-client/dist/transports/nodeHttp';
import { DefaultTransportFactory } from 'grpc-web-client/dist/transports/Transport';

export {MetabackendService, pb};


/**
 * Client of a Getline metabackend service.
 *
 * The Metabackend service is used to:
 *  - index loans and quickly retrieve them by ID, state or owner
 *  - keep metadata that would be expensive to keep on-chain
 *  - serve versioned smart contract information to clients
 *
 */
export class MetabackendClient {
    private metabackendHost: string;
    private network: string;
    private contractDefinitions: Array<pb.Contract> | undefined;
    private contractDefinitionsLock: Mutex
    private debug: boolean

    private log(...msg: Array<string>) {
        if (!this.debug) {
            return;
        }
        console.log("[getline.ts/metabackend]", ...msg);
    }

    public constructor(host: string, network: string, debug?: boolean) {
        this.metabackendHost = host;
        this.network = network;
        this.contractDefinitionsLock = new Mutex;

        if (debug == undefined) {
            debug = false;
        }
        this.debug = debug;
    }

    /**
     * Invokes a gRPC method on the metabackend.
     */
    public  async invoke<TReq extends jspb.Message, TRes extends jspb.Message>
                                   (method: grpc.MethodDefinition<TReq, TRes>, req: TReq): Promise<TRes> {
        return new Promise<TRes>((resolve, reject)=>{
            let transport = DefaultTransportFactory.detectTransport();
            // Are we running in Node? Force using nodeHttpRequest.
            if (IsNode) {
                transport = nodeHttpRequest;
            }
            grpc.invoke(method, {
                request: req,
                host: this.metabackendHost,
                onMessage: (res: TRes) => { resolve(res); },
                transport: transport,
                onEnd: (code: Code, msg: string | undefined, trailers: Metadata) => {
                    if (code != Code.OK) {
                        reject(new Error("gRPC failed (" + code + "): " + msg));
                    }
                }
            });
        });
    }

    /**
     * Loads all contract definitions for a given network from the metabackend.
     */
    private async getContractDefinitions(): Promise<Array<pb.Contract>> {
        let release = await this.contractDefinitionsLock.acquire();

        if (this.contractDefinitions != undefined) {
            release();
            return this.contractDefinitions;
        }
        this.log("downloading contract definitions from metabackend...");
        let req = new pb.GetDeploymentRequest();
        req.setNetworkId(this.network);
        let res = await this.invoke(MetabackendService.GetDeployment, req);
        if (res.getNetworkId() != this.network) {
            release();
            throw new Error("getline.ts: metabackend responded with invalid network");
        }
        this.contractDefinitions = res.getContractList();

        release();
        return this.contractDefinitions;
    }


    /**
     * Returns a Web3 JSON ABI for a given contract name.
     */
    public async getABI(name: string): Promise<Array<Web3.AbiDefinition>> {
        let pbContract: pb.Contract | undefined = undefined;
        let allContracts = await this.getContractDefinitions();
        for (let i = 0; i < allContracts.length; i++) {
            let c = allContracts[i];
            if (c.getName() == name) {
                pbContract = c;
                break
            }
        }
        if (pbContract == undefined) {
            throw new Error("getline.ts: no contract " + name + " found on metabackend");
        }
        if (!pbContract.hasAbi()) {
            throw new Error("getline.ts: contract " + name + " has no ABI on metabackend");
        }
        let json = pbContract.getAbi()!.getJson_asU8();
        let jsonString = new encoding.TextDecoder("utf-8").decode(json);
        return JSON.parse(jsonString);
    }

    /**
     * Gets the bytecode of a contract from the metabackend.
     */
    public async getBytecode(name: string): Promise<string> {
        let pbContract: pb.Contract | undefined = undefined;
        let allContracts = await this.getContractDefinitions();
        for (let i = 0; i < allContracts.length; i++) {
            let c = allContracts[i];
            if (c.getName() == name) {
                pbContract = c;
                break
            }
        }
        if (pbContract == undefined) {
            throw new Error("getline.ts: no contract " + name + " found on metabackend");
        }
        if (!pbContract.hasAbi()) {
            throw new Error("getline.ts: contract " + name + " has no ABI on metabackend");
        }
        return pbContract.getLinkedBinary();
    }
}

