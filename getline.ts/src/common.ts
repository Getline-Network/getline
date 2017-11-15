import {BigNumber} from 'bignumber.js';

import {Blockchain} from './blockchain';
import {pb} from './metabackend';


export const TOKEN_CONTRACT = 'PrintableToken';
export const LOAN_CONTRACT = 'Loan';


/**
 * Ethereum address of a contract or account.
 */
export class Address {
    protected blockchain: Blockchain;
    public readonly ascii: string;

    constructor(blockchain: Blockchain, ascii: string) {
        this.blockchain = blockchain;
        this.ascii = ascii;
    }

    /**
     * Returns a token's balance of this address.
     * @param token ERC20 compatible token.
     * @returns balance
     */
    public async balance(token: Token): Promise<BigNumber> {
        return token.balanceOf(this);
    }

    /**
     * Converts this address to a proto representation.
     * @returns This address as a protobuf.
     */
    public proto(): pb.Address {
        let address = new pb.Address();
        address.setAscii(this.ascii);
        return address;
    }

    /**
     * Converts this address to a Token.
     * @returns This address as a token.
     */
    public token(): Token {
        return new Token(this.blockchain, this.ascii);
    }

    /**
     * Compares two addresses for equality, ie. if they are the same address.
     * @param other Address to compare with.
     * @returns Whether addresses are equal.
     */
    public eq(other: Address): boolean {
        return this.ascii.toLowerCase() == other.ascii.toLowerCase()
    }
}

/**
 * Ethereum ERC-20 compatible token.
 */
export class Token extends Address {
    /**
     * Returns this token's balance of an address.
     * @param address Address of which balance to get.
     * @returns Balance in this token.
     */
    public async balanceOf(address: Address): Promise<BigNumber> {
        let token = await this.blockchain.existing(TOKEN_CONTRACT, this);
        return token.call<BigNumber>('balanceOf', address.ascii);
    }

    /**
     * Returns this token's allowance of an address and spender.
     * @param owner Owner of tokens.
     * @param spender Spender of tokens.
     * @returns Balance in this token.
     */
    public async allowance(owner: Address, spender: Address): Promise<BigNumber> {
        let token = await this.blockchain.existing(TOKEN_CONTRACT, this);
        return token.call<BigNumber>('allowance', owner.ascii, spender.ascii);
    }

    /**
     * Sets this token's allowance of a spender from the current coinbase.
     * @param spender Spender of tokens.
     * @param value New allowance for this spender.
     * @returns Balance in this token.
     */
    public async approve(spender: Address, value: BigNumber): Promise<void> {
        let token = await this.blockchain.existing(TOKEN_CONTRACT, this);
        return token.call<void>('approve', spender.ascii, value);
    }
}

/**
 * Waits asynchronously until a promise is true.
 * @param check Predicate.
 */
export async function waitUntil(check: ()=>Promise<boolean>): Promise<void> {
    return new Promise<void>((resolve, reject)=>{
        let interval = setInterval(()=>{
            check().then((okay: boolean)=>{
                if (okay) {
                    clearInterval(interval);
                    resolve();
                }
            }).catch(reject);
        }, 1000);
    });
}

