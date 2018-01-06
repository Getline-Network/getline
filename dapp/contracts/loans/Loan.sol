pragma solidity ^0.4.17;

import "./InvestorLedger.sol";
import "../tokens/IToken.sol";


contract Loan {
    using InvestorLedger for InvestorLedger.Ledger;
    InvestorLedger.Ledger ledger;   


    function Loan(
        //IAtestor _atestator,
        IToken _collateralToken,
        IToken _loanToken,
        address _borrower,
        uint256 _amountWanted,
        uint16  _interestPermil,
        uint64 _fundraisingDeadline,
        uint64 _paybackDeadline
    ) public {
        require(_amountWanted > 0);
        
        ledger = InvestorLedger.openAccount(
            _collateralToken,
            _loanToken,
            _borrower,
            _amountWanted,
            _interestPermil,
            _fundraisingDeadline,
            _paybackDeadline
        );
    }

    // View functions that directly return InvestorLedger data.

    function collateralToken() view public returns (IToken _tokenAddress) {
        return ledger.collateralToken;
    }

    function loanToken() view public returns (IToken _tokenAddress) {
        return ledger.loanToken;
    }

    function amountWanted() view public returns (uint256 _amountWanted) {
        return ledger.amountWanted;
    }

    function borrower() view public returns (address _borrower) {
        return ledger.borrower;
    }

    function interestPermil() view public returns (uint16 _interestPermil) {
        return ledger.interestPermil;
    }

    function state() view public returns (uint256 _state) {
        return uint256(ledger.state);
    }

    function paybackRequired() view public returns (uint256 _totalPayback) {
        return ledger.paybackRequired();
    }

    function totalAmountInvested() view public returns (uint256 _totalAmount) {
        return ledger.totalAmountInvested();
    }

    function amountInvested(address investor) view public returns (uint256 _amount) {
        return ledger.amountInvested(investor);
    }

    function fundraisingDeadline() view public returns (uint64 _fundraisingDeadline) {
        return ledger.fundraisingDeadline;
    }

    function paybackDeadline() view public returns (uint64 _paybackDeadline) {
        return ledger.paybackDeadline;
    }

    function fundraisingDelta() view public returns (uint64 _fundraisingDelta) {
        return ledger.fundraisingDelta;
    }

    function paybackDelta() view public returns (uint64 _paybackDelta) {
        return ledger.paybackDelta;
    }

    function receivedCollateral() view public returns (uint256 _amount) {
        return ledger.receivedCollateral;
    }


    // Three explicit state changing functions. All of them call their
    // respective ledger process functions, and then process any further new
    // state that can arise and that might not require funds to be sent (ie.
    // process a cancelement, default or post-payback condition).

    // gatherCollateral should be called by the the borrower to submit the
    // collateral for the loan.
    function gatherCollateral() public {
        ledger.collateralCollectionProcess(msg.sender);
    }

    // invest should be called by an investor to submit an investment. It can
    // also advance the state to either payback (no further processing
    // necessary) or canceled (state needs to be processed to send investments
    // back).
    function invest() public {
        ledger.fundraisingProcess(msg.sender);
        if (ledger.state == InvestorLedger.State.Canceled) {
            ledger.canceledProcess();
        }
    }

    // payback should be called by the borrower to submit the loan payback. It
    // can also advance the state to either paidback (needs processing to send
    // investment and collateral back) or defaulted (needs processing to send
    // collateral back to investors).
    function payback() public {
        ledger.paybackProcess(msg.sender);
        if (ledger.state == InvestorLedger.State.Paidback) {
            ledger.paidbackProcess();
        } else  if (ledger.state == InvestorLedger.State.Defaulted) {
            ledger.defaultedProcess();
        }
    }

    // poke advances the state if possible. This can be called by clients to
    // see if a timeout occured but hasen't been processed yet.
    function poke() public returns (uint256 _newState) {
        // We do not want to simulate if we act as an user, so let's tell the
        // contract that we are address 0x0 - which should not have any loans
        // approved for the contract and thus cannot influence state changes
        // other than by timeouts.
        if (ledger.state == InvestorLedger.State.Fundraising) {
            ledger.fundraisingProcess(0x0);
        } else if (ledger.state == InvestorLedger.State.Payback) {
            ledger.paybackProcess(0x0);
        }
        // These two shouldn't happen (we advance them as soon as we see them
        // in invest()/payback(), but let's allow for them anyway.
        else if (ledger.state == InvestorLedger.State.Paidback) {
            ledger.paidbackProcess();
        } else if (ledger.state == InvestorLedger.State.Canceled) {
            ledger.canceledProcess();
        }
        return uint256(ledger.state);
    }
}
