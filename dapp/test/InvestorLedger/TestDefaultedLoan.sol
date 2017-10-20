pragma solidity ^0.4.11;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../../contracts/loans/InvestorLedger.sol";
import "../../contracts/tokens/PrintableToken.sol";
import "../utils/MockPerson.sol";

contract TestDefaultedLoan {
    uint256 totalLoanNeeded = 100;
    uint16 interestPermil = 200;
    uint256 printValue = 100;
    PrintableToken collateralToken = new PrintableToken("collateralToken", 0, "token_symbol", printValue);
    PrintableToken loanToken = new PrintableToken("loanToken", 0, "token_symbol", printValue);
    MockPerson borrower = new MockPerson(loanToken, collateralToken);
    InvestorLedger.Ledger testLedger = InvestorLedger.openAccount(
        collateralToken, loanToken, address(borrower), totalLoanNeeded, interestPermil);

    function testMarkDefaulted() {
        borrower.printMeCollateralTokens();
        InvestorLedger.gatherCollateral(testLedger);
        InvestorLedger.markDefaulted(testLedger);
        Assert.equal(testLedger.loanDefaulted, true, "It should mark loan as defaulted");
        Assert.equal(collateralToken.balanceOf(borrower), printValue, "It should send collateral back to borrower");
        /* TODO why collateral is being sent back when the loan is marked as defaulted */
    }
}
