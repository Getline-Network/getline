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
     * Cache for contract properties.
     */
    private propertyCache: { [key: string]: any } = {};

    /**
     * Returns a caching getter for a constant contract property.
     * @param key Name of contract property.
     * @returns Getter for contract property.
     */
    private contractProperty<T>(key: string): (() => Promise<T>) {
        return async ()=>{
            if (this.propertyCache[key] != undefined) {
                return this.propertyCache[key];
            }
            let token = await this.blockchain.existing(TOKEN_CONTRACT, this);
            this.propertyCache[key] = await token.call<T>(key);
            return this.propertyCache[key];
        }
    }

    /**
     * Returns token symbol.
     */
    public symbol = this.contractProperty<string>('symbol');
    /**
     * Returns token name.
     */
    public name = this.contractProperty<string>('name');

    private decimalsBigNumber = this.contractProperty<BigNumber>('decimals');
    /**
     * Returns token decimal places count.
     *
     * TODO(q3k): Replace this once our smart contracts start returning uint8,
     * per ERC20.
     */
    public async decimals(): Promise<BigNumber> {
        let d = await this.decimalsBigNumber()
        if (d.gt(255) || d.lt(0) || d.dp() != 0) {
            throw new Error("Invalid token decimal places count")
        }
        return d;
    }


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


    /**
     * Converts a decimal representation of the token into the internal integer
     * representation.
     * @param human Token amount with decimal point.
     * @returns Internal integer representation.
     */
    public async integerize(human: BigNumber): Promise<BigNumber> {
        let decimals = (await this.decimals()).toNumber();
        return human.shift(decimals);
    }

    /**
     * Converts an integer representation of the tokan into a human-friendly
     * decimal point representation.
     * @param internal Token amount as integer.
     * @returns Human-readable decimal point representation.
     */
    public async humanize(internal: BigNumber): Promise<BigNumber> {
        let decimals = (await this.decimals()).toNumber();
        return internal.shift(-decimals);
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

