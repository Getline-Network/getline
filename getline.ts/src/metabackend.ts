import {Mutex, MutexInterface} from "async-mutex";
import * as debug from "debug";
import * as jspb from "google-protobuf";
import * as IsNode from "is-node";
import * as encoding from "text-encoding";
import * as Web3 from "web3";

import * as pb from "./generated/metabackend_pb";
import {Metabackend as MetabackendService} from "./generated/metabackend_pb_service";

import {grpc} from "grpc-web-client";
import {Code, Metadata, Transport} from "grpc-web-client";
import nodeHttpRequest from "grpc-web-client/dist/transports/nodeHttp";
import { DefaultTransportFactory } from "grpc-web-client/dist/transports/Transport";

export {MetabackendService, pb};

const logger = debug("getline.ts:metabackend");

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
    private contractDefinitions: pb.Contract[] | undefined;
    private contractDefinitionsLock: Mutex;

    public constructor(host: string, network: string) {
        this.metabackendHost = host;
        this.network = network;
        this.contractDefinitionsLock = new Mutex();
    }

    /**
     * Invokes a gRPC method on the metabackend.
     */
    public async invoke<TReq extends jspb.Message, TRes extends jspb.Message>(
            method: grpc.MethodDefinition<TReq, TRes>, req: TReq): Promise<TRes> {
        return new Promise<TRes>((resolve, reject) => {
            logger(`Invoking ${method.methodName}...`);
            let trans = DefaultTransportFactory.detectTransport();
            // Are we running in Node? Force using nodeHttpRequest.
            if (IsNode) {
                trans = nodeHttpRequest;
            }
            grpc.invoke(method, {
                host: this.metabackendHost,
                onEnd: (code: Code, msg: string | undefined, trailers: Metadata) => {
                    if (code !== Code.OK) {
                        logger(`Failed (${code}): ${msg}`);
                        reject(new Error("gRPC failed (" + code + "): " + msg));
                    }
                },
                onMessage: (res: TRes) => {
                    logger("Success.");
                    resolve(res);
                },
                request: req,
                transport: trans,
            });
        });
    }

    /**
     * Returns a Web3 JSON ABI for a given contract name.
     */
    public async getABI(name: string): Promise<Web3.AbiDefinition[]> {
        let pbContract: pb.Contract | undefined;
        const allContracts = await this.getContractDefinitions();
        for (const c of allContracts) {
            if (c.getName() === name) {
                pbContract = c;
                break;
            }
        }
        if (pbContract === undefined) {
            throw new Error("getline.ts: no contract " + name + " found on metabackend");
        }
        if (!pbContract.hasAbi()) {
            throw new Error("getline.ts: contract " + name + " has no ABI on metabackend");
        }
        const json = pbContract.getAbi()!.getJson_asU8();
        const jsonString = new encoding.TextDecoder("utf-8").decode(json);
        return JSON.parse(jsonString);
    }

    /**
     * Gets the bytecode of a contract from the metabackend.
     */
    public async getBytecode(name: string): Promise<string> {
        let pbContract: pb.Contract | undefined ;
        const allContracts = await this.getContractDefinitions();
        for (const c of allContracts) {
            if (c.getName() === name) {
                pbContract = c;
                break;
            }
        }
        if (pbContract === undefined) {
            throw new Error("getline.ts: no contract " + name + " found on metabackend");
        }
        if (!pbContract.hasAbi()) {
            throw new Error("getline.ts: contract " + name + " has no ABI on metabackend");
        }
        return pbContract.getLinkedBinary();
    }

    /**
     * Loads all contract definitions for a given network from the metabackend.
     */
    private async getContractDefinitions(): Promise<pb.Contract[]> {
        const release = await this.contractDefinitionsLock.acquire();

        if (this.contractDefinitions !== undefined) {
            release();
            return this.contractDefinitions;
        }
        logger("Downloading contract definitions from metabackend...");
        const req = new pb.GetDeploymentRequest();
        req.setNetworkId(this.network);
        const res = await this.invoke(MetabackendService.GetDeployment, req);
        if (res.getNetworkId() !== this.network) {
            release();
            throw new Error("getline.ts: metabackend responded with invalid network");
        }
        this.contractDefinitions = res.getContractList();

        release();
        return this.contractDefinitions;
    }
}
