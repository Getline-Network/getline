var MathContract = artifacts.require("./common/Math.sol");
var InvestorLedger = artifacts.require("./loans/InvestorLedger.sol");
var Loan = artifacts.require("./loans/Loan.sol");

module.exports = function(deployer) {
  return deployer
    .deploy(MathContract)
    .then(() => deployer.link(MathContract, InvestorLedger))
    .then(() => deployer.deploy(InvestorLedger))
    .then(() => deployer.link(InvestorLedger, Loan));
};
