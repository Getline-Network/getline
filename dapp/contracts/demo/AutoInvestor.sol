pragma solidity ^0.4.11;

import "../tokens/IToken.sol";
import "../tokens/PrintableToken.sol";
import "../loans/Loan.sol";

// Auto-invests total amount in loan by printing money
contract AutoInvestor {
    PrintableToken private collateralToken;
    PrintableToken private tokenA;
    PrintableToken private tokenB;

    event Invested(Loan indexed loan);

    function AutoInvestor(
        PrintableToken _collateralToken,
        PrintableToken _tokenA,
        PrintableToken _tokenB
    ) {
        collateralToken = _collateralToken;
        tokenA = _tokenA;
        tokenB = _tokenB;
    }

    function invest(Loan loan) {
        require(loan.collateralToken() == collateralToken);
        IToken borrowedIToken = loan.borrowedToken();
        require(borrowedIToken == tokenA || borrowedIToken == tokenB);

        PrintableToken borrowedToken = PrintableToken(borrowedIToken);
        uint256 amountWanted = loan.amountWanted();

        require(amountWanted <= borrowedToken.printValue());

        borrowedToken.print(this);
        borrowedToken.approve(loan, amountWanted);
        loan.invest();
        Invested(loan);
    }
}