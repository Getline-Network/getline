import * as jspb from "google-protobuf";
import {grpc, Code, Metadata} from "grpc-web-client";
import {BigNumber} from 'bignumber';

import {Metabackend} from "./generated/metabackend_pb_service";
import * as pb from "./generated/metabackend_pb";

export class Loan {
	public parameters: {
		collateralTokenAddress: string
		loanTokenAddress: string
		liegeAddress: string
	}
	public shortId: string
	public description: string

	constructor(proto: pb.LoanCache) {
		this.shortId = proto.getShortId();
		this.description = "";
		let params = proto.getParameters();
		this.parameters = {
			collateralTokenAddress: params.getCollateralToken().getAscii(),
			loanTokenAddress: params.getLoanToken().getAscii(),
			liegeAddress: params.getLiege().getAscii(),
		};
	}
}

export class Client {
    private metabackendHost: string;
    private network: string;

    private async invokeMetabackend<TReq extends jspb.Message, TRes extends jspb.Message>
                                   (method: grpc.MethodDefinition<TReq, TRes>, req: TReq): Promise<TRes> {
        return new Promise<TRes>((resolve, reject)=>{
            grpc.invoke(method, {
                request: req,
                host: this.metabackendHost,
                onMessage: resolve,
                onEnd: (code: Code, msg: string | undefined, trailers: Metadata) => {
                    if (code != Code.OK) {
                        reject("gRPC failed (" + code + "): " + msg);
                    }
                }
            });
        });
    }

    constructor(metabackend: string, network: string) {
        this.metabackendHost = metabackend;
        this.network = network;
    }

    public async addNewLoan(description: string, amount: BigNumber, rate: number, paybackTime: number): Promise<Loan> {
        let address = "0xd6d9520D315CDbC773B6087b0190b97B5BaAd6b3";

        let indexReq = new pb.IndexLoanRequest();
        indexReq.setDescription(description);
        indexReq.setNetworkId(this.network);
        let loanAddress = new pb.Address();
        loanAddress.setAscii(address);
        indexReq.setLoan(loanAddress);

        let indexRes = await this.invokeMetabackend(Metabackend.IndexLoan, indexReq);
        console.log("Created Loan ", indexRes.getShortId());

        return this.getLoanByShortId(indexRes.getShortId());
    }

    public async getLoanByShortId(shortId: string): Promise<Loan> {
        let req = new pb.GetLoansRequest();
        req.setNetworkId(this.network);
        req.setShortId(shortId);

        let res = await this.invokeMetabackend(Metabackend.GetLoans, req);
        if (res.getNetworkId() != this.network) {
			throw new Error("Invalid network ID in response.");
        }

        return new Loan(res.getLoanCacheList()[0]);
    }

    public async getLoansByOwner(owner: string): Promise<Array<Loan>> {
        let req = new pb.GetLoansRequest();
        req.setNetworkId(this.network);
        let address = new pb.Address();
        address.setAscii(owner);
        req.setOwner(address);

        let res = await this.invokeMetabackend(Metabackend.GetLoans, req);
        if (res.getNetworkId() != this.network) {
			throw new Error("Invalid network ID in response.");
        }

		let loans : Array<Loan> = [];
		res.getLoanCacheList().forEach((elem) => {
			loans.push(new Loan(elem));
		});
        return loans;
    }
}
