pragma solidity ^0.4.11;

import "../../contracts/tokens/PrintableToken.sol";


contract MockPerson {
    PrintableToken loanToken;
    PrintableToken collateralToken;

    function MockPerson(PrintableToken _loanToken, PrintableToken _collateralToken) {
        loanToken = _loanToken;
        collateralToken = _collateralToken;
    }

    function printMeCollateralTokens() {
        collateralToken.print(this);
        collateralToken.approve(msg.sender, collateralToken.printValue());
    }

    function printMeLoanTokens() {
        loanToken.print(this);
        loanToken.approve(msg.sender, loanToken.allowance(this, msg.sender) + loanToken.printValue());
    }
}