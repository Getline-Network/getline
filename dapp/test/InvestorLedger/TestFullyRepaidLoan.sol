pragma solidity ^0.4.11;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../../contracts/loans/InvestorLedger.sol";
import "../../contracts/tokens/PrintableToken.sol";
import "../utils/MockPerson.sol";


contract TestFullyRepaidLoan {
    uint256 totalLoanNeeded = 100;
    uint16 interestPermil = 2000;
    uint256 printValue = 100;
    PrintableToken collateralToken = new PrintableToken("collateralToken", 0, "token_symbol", printValue);
    PrintableToken loanToken = new PrintableToken("loanToken", 0, "token_symbol", printValue);
    MockPerson borrower = new MockPerson(loanToken, collateralToken);
    MockPerson investor = new MockPerson(loanToken, collateralToken);
    InvestorLedger.Ledger testLedger = InvestorLedger.openAccount(
        collateralToken, loanToken, address(borrower), totalLoanNeeded, interestPermil);

    function testFullyRepaidLoan() {
        /* Testing pre-loan-release phase */
        borrower.printMeCollateralTokens();
        investor.printMeLoanTokens();
        InvestorLedger.gatherCollateral(testLedger);
        InvestorLedger.gatherInvestment(testLedger, address(investor));
        Assert.equal(loanToken.balanceOf(investor), 0, "It should transfer loan tokens to investorLedger");
        InvestorLedger.releaseLoanToBorrower(testLedger);

        /* Testing post-loan-release phase */
        Assert.equal(loanToken.balanceOf(borrower), printValue, "It should transfer loan tokens to borrower");
        borrower.printMeLoanTokens();
        borrower.printMeLoanTokens();
        Assert.equal(testLedger.totalPaybackNeeded, 200, "It should mark loan as defaulted");
        InvestorLedger.gatherPayback(testLedger);
        Assert.equal(loanToken.balanceOf(this), 2 * printValue, "It should transfer loan tokens to investorLedger");
    }
}
