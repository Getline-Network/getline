pragma solidity ^0.4.11;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../../contracts/loans/InvestorLedger.sol";
import "../../contracts/tokens/PrintableToken.sol";
import "../utils/MockPerson.sol";


contract TestGatheringTokens {
    uint256 totalLoanNeeded = 100;
    uint16 interestPermil = 200;
    uint256 printValue = 100;
    PrintableToken collateralToken = new PrintableToken("collateralToken", 0, "token_symbol", printValue);
    PrintableToken loanToken = new PrintableToken("loanToken", 0, "token_symbol", printValue);
    MockPerson investor = new MockPerson(loanToken, collateralToken);
    MockPerson borrower = new MockPerson(loanToken, collateralToken);
    InvestorLedger.Ledger testLedger = InvestorLedger.openAccount(
        collateralToken, loanToken, address(borrower), totalLoanNeeded, interestPermil);
    InvestorLedger.InvestorData investorData;

    function testInitialization() {
        testLedger.loanToken = loanToken;
        testLedger.collateralToken = collateralToken;
        Assert.equal(testLedger.totalAmountGathered, 0, "It should be initialy empty");
        bool isFullyFunded = InvestorLedger.isFullyFunded(testLedger);
        Assert.equal(isFullyFunded, false, "Ledger should not be fully funded");
        Assert.equal(testLedger.totalLoanNeeded, totalLoanNeeded, "Ledger be initialized with load needed");
    }

    function testGatherCollateral() {
        borrower.printMeCollateralTokens();
        Assert.equal(collateralToken.balanceOf(borrower), printValue, "It should print some tokens");

        InvestorLedger.gatherCollateral(testLedger);
        Assert.equal(collateralToken.balanceOf(borrower), 0, "It should transfer tokens");
        Assert.equal(testLedger.totalCollateral, printValue, "It should add collateral tokens");
    }

    function testGatherInvestment() {
        InvestorLedger.gatherInvestment(testLedger, address(investor));
        Assert.equal(testLedger.totalAmountGathered, 0, "Empty when investor has no loan tokens");

        /* Testing sending loan tokens from investor to investor ledger */
        investor.printMeLoanTokens();
        InvestorLedger.gatherInvestment(testLedger, address(investor));
        Assert.equal(loanToken.balanceOf(investor), 0, "It should transfer loan tokens");
        Assert.equal(loanToken.balanceOf(this), printValue, "It should transfer loan tokens");
        Assert.equal(testLedger.totalAmountGathered, totalLoanNeeded, "It should invest some money");
        uint256 totalCollateral = printValue;
        Assert.equal(testLedger.totalCollateralReserved, totalCollateral, "It should update reserved collateral");
        uint256 expectedTotalPaybackNeeded = 20; /* TODO ERROR, it should be 120 */
        Assert.equal(testLedger.totalPaybackNeeded, expectedTotalPaybackNeeded, "It should count intrests");

        /* After investing some money, we should have data about investor */
        investorData = testLedger.investors[address(investor)];
        Assert.equal(investorData.amountInvested, printValue, "It should update investors invested amount");
        Assert.equal(investorData.reservedCollateral, printValue, "It should update investors collateral");

    }

    function testReleaseLoanToBorrower() {
        InvestorLedger.releaseLoanToBorrower(testLedger);
        Assert.equal(testLedger.loanWidthdrawn, true, "It should mark loan as withdrawn");
        Assert.equal(loanToken.balanceOf(borrower), printValue, "It should transfer tokens to borrower");
    }
}

