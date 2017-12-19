pragma solidity ^0.4.11;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../../contracts/loans/InvestorLedger.sol";
import "../../contracts/tokens/PrintableToken.sol";
import "../utils/MockPerson.sol";


contract TestCancelledLoan {
    uint256 totalLoanNeeded = 100;
    uint16 interestPermil = 200;
    uint256 printValue = 100;
    PrintableToken collateralToken = new PrintableToken("collateralToken", 0, "token_symbol", printValue);
    PrintableToken loanToken = new PrintableToken("loanToken", 0, "token_symbol", printValue);
    MockPerson borrower = new MockPerson(loanToken, collateralToken);
    MockPerson investor = new MockPerson(loanToken, collateralToken);
    InvestorLedger.Ledger testLedger = InvestorLedger.openAccount(
        collateralToken, loanToken, address(borrower), totalLoanNeeded, interestPermil);

    function testMarkCancelled() {
        borrower.printMeCollateralTokens();
        investor.printMeLoanTokens();
        InvestorLedger.gatherCollateral(testLedger);
        InvestorLedger.gatherInvestment(testLedger, address(investor));
        InvestorLedger.markCancelled(testLedger);
        Assert.equal(testLedger.loanCancelled, true, "It should mark loan as canceled");
        Assert.equal(collateralToken.balanceOf(borrower), printValue, "It should send collateral back to borrower");

        /* Testing withdrawing investment */
        Assert.equal(loanToken.balanceOf(investor), 0, "Investor should invest his loan tokens");
        InvestorLedger.withdrawInvestment(testLedger, address(investor));
        Assert.equal(loanToken.balanceOf(investor), printValue, "Investor should get back his invested money");

    }
}
