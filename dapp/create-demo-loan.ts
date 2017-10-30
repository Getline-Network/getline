import * as Contract from "truffle-contract";
import * as Web3 from "web3";

import * as LoanArtifacts from "./build/contracts/Loan.json";
import * as PrintableTokenArtifacts from "./build/contracts/PrintableToken.json";

let provider = new Web3.providers.HttpProvider("http://localhost:8545");
let web3 = new Web3(provider);

var contracts: { [key:string]:any } = {};
let artifacts = [ LoanArtifacts, PrintableTokenArtifacts ];

artifacts.forEach((artifact) => {
    let contract = Contract(artifact);
    contract.setProvider(provider)
    contract.defaults({
            from: web3.eth.coinbase,
            gas: 4612388,
    });
    contracts[contract.contract_name] = contract;
});

async function createDemoLoan() {
    let us = web3.eth.coinbase;
    console.log("Deploying Token A...");
    let tokenA = await contracts['PrintableToken'].new("Demo Token A", 2, "TKNA", 100000);
    console.log("Token A deployed at ", tokenA.address);
    console.log("Printing token A...");
    await tokenA.print(us);

    console.log("Deploying Token B...");
    let tokenB = await contracts['PrintableToken'].new("Demo Token B", 2, "TKNB", 100000);
    console.log("Token B deployed at ", tokenB.address);
    console.log("Printing token B...");
    await tokenB.print(us);

    let currentBlock = web3.eth.blockNumber;
    // Assuming we're on Rinkeby and we get one block every 15 seconds.
    let blocksPerDay = (60 * 60 * 24) / 15;
    let fundraisingEnd = currentBlock + blocksPerDay * 7;
    let paybackEnd = currentBlock + blocksPerDay * 30;
    console.log("Deploying test loan...");
    let loan = await contracts['Loan'].new(tokenA.address, tokenB.address, us, 100000000, 5000, fundraisingEnd, paybackEnd);
    console.log("Test loan at ", loan.address);
}

createDemoLoan().catch((error)=>{
    console.log(error);
});
