import * as jspb from 'google-protobuf';
import * as Web3 from 'web3';
import * as encoding from 'text-encoding';
import * as IsNode from 'is-node';
import {Metabackend} from './generated/metabackend_pb_service';
import * as pb from "./generated/metabackend_pb";

import {grpc, Code, Metadata, Transport} from 'grpc-web-client';
import nodeHttpRequest from 'grpc-web-client/dist/transports/nodeHttp';
import { DefaultTransportFactory } from 'grpc-web-client/dist/transports/Transport';


export class MetabackendClient {
    private metabackendHost: string;
    private network: string;
    private contractDefinitions: Array<pb.Contract> | undefined;

    public constructor(host: string, network: string) {
        this.metabackendHost = host;
        this.network = network;
    }

    private async getContractDefinitions(): Promise<Array<pb.Contract>> {
        if (this.contractDefinitions != undefined) {
            return this.contractDefinitions;
        }
        console.log("getline.ts: downloading contract definitions from metabackend...");
        let req = new pb.GetDeploymentRequest();
        req.setNetworkId(this.network);
        let res = await this.invoke(Metabackend.GetDeployment, req);
        if (res.getNetworkId() != this.network) {
            throw new Error("getline.ts: metabackend responded with invalid network");
        }
        this.contractDefinitions = res.getContractList();
        return this.contractDefinitions;
    }

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
        let json = pbContract.getAbi().getJson_asU8();
        let jsonString = new encoding.TextDecoder("utf-8").decode(json);
        return JSON.parse(jsonString);
    }

    public  async invoke<TReq extends jspb.Message, TRes extends jspb.Message>
                                   (method: grpc.MethodDefinition<TReq, TRes>, req: TReq): Promise<TRes> {
        return new Promise<TRes>((resolve, reject)=>{
            let transport = DefaultTransportFactory.detectTransport();
            // Are we running in Node? Force using nodeHttpRequest.
            if (IsNode) {
                console.log("getline.ts: forcing node.js transport for gRPC")
                transport = nodeHttpRequest;
            }
            grpc.invoke(method, {
                request: req,
                host: this.metabackendHost,
                onMessage: resolve,
                transport: transport,
                onEnd: (code: Code, msg: string | undefined, trailers: Metadata) => {
                    if (code != Code.OK) {
                        reject(new Error("gRPC failed (" + code + "): " + msg));
                    }
                }
            });
        });
    }

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

