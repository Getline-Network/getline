pragma solidity ^0.4.11;

import "../tokens/IToken.sol";
import "../common/Math.sol";


library InvestorLedger {
    uint constant PERMIL = 1000;

    function openAccount(
        IToken collateralToken,
        IToken loanToken,
        address liege,
        uint256 totalLoanNeeded,
        uint16 interestPermil) internal returns (Ledger account)
    {
        account.collateralToken = collateralToken;
        account.loanToken = loanToken;
        account.totalLoanNeeded = totalLoanNeeded;
        account.interestPermil = interestPermil;

        account.liege = liege;

        return account;
    }

    function gatherCollateral(Ledger storage account) {
        var allowance = account.collateralToken.allowance(account.liege, this);
        account.totalCollateral += allowance;
        require(
            account.collateralToken.transferFrom(
                account.liege,
                this,
                allowance
            )
        );
    }

    function gatherInvestment(Ledger storage account, address trustee) {
        var investmentAmount = Math.min(
            account.loanToken.allowance(trustee, this),
            account.totalLoanNeeded - account.totalAmountGathered
        );
        require(account.loanToken.transferFrom(
            trustee,
            this,
            investmentAmount));
        var investmentPermil = investmentAmount * PERMIL / account.totalLoanNeeded;
        var collateralReseverved = investmentPermil * account.totalCollateral / PERMIL;

        account.totalAmountGathered += investmentAmount;
        account.totalCollateralReserved += collateralReseverved;
        account.totalPaybackNeeded += calculateInterest(account, investmentAmount);

        var investor = account.investors[trustee];
        investor.amountInvested += investmentAmount;
        investor.reservedCollateral += collateralReseverved;
    }

    function gatherPayback(Ledger storage account) {
        require(!account.loanCancelled && !account.loanDefaulted);

        require(account.loanToken.allowance(account.liege, this) >= account.totalPaybackNeeded);
        require(account.loanToken.transferFrom(account.liege, this, account.totalPaybackNeeded));

        collateralToLiege(account);
    }

    function markCancelled(Ledger storage account) {
        require(!account.loanCancelled && !account.loanDefaulted);

        account.loanCancelled = true;

        collateralToLiege(account);
    }

    function markDefaulted(Ledger storage account) {
        require(!account.loanCancelled && !account.loanDefaulted);

        account.loanDefaulted = true;
    }

    function collateralToLiege(Ledger storage account) {
        var amountToTransfer = account.totalCollateral;
        if (account.loanDefaulted) {
            amountToTransfer -= account.totalCollateralReserved;
        }
        require(account.collateralToken.transfer(account.liege, amountToTransfer));
    }

    function withdrawInvestment(Ledger storage account, address trustee) {
        var investor = account.investors[trustee];
        
        if (account.loanDefaulted) {
            var reservedCollateral = investor.reservedCollateral;
            investor.reservedCollateral = 0;
            require(account.collateralToken.transfer(trustee, reservedCollateral));
        } else {
            var amountInvested = investor.amountInvested;
            if (!account.loanCancelled) {
                amountInvested += calculateInterest(account, amountInvested);
            }
            investor.amountInvested = 0;
            require(account.loanToken.transfer(trustee, amountInvested));
        }

        delete account.investors[trustee];
    }

    function releaseLoanToBorrower(Ledger storage account) {
        require(account.loanWidthdrawn == false);

        account.loanWidthdrawn = true;

        require(account.loanToken.transfer(account.liege, account.totalAmountGathered));
    }

    function isFullyFunded(Ledger storage account) constant returns (bool fullyFunded) {
        return account.totalAmountGathered == account.totalLoanNeeded;
    }
    
    function calculateInterest(Ledger storage account, uint256 investment) private constant returns (uint256 interest) {
        return investment * account.interestPermil / PERMIL;
    }

    struct Ledger {
        // Config
        IToken collateralToken;
        IToken loanToken;

        address liege;
        uint256 totalCollateral;
        uint256 totalLoanNeeded;
        uint16  interestPermil;
        uint256 paybackDeadlineBlock;
        mapping(address => InvestorData) investors;

        uint256 totalAmountGathered;

        uint256 totalCollateralReserved;
        uint256 totalPaybackNeeded;
        
        bool loanCancelled;
        bool loanDefaulted;
        bool loanWidthdrawn;
    }

    struct InvestorData {
        uint256 reservedCollateral;
        uint256 amountInvested;
    }
}
