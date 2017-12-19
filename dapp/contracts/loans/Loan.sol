pragma solidity ^0.4.11;

import "./IAtestor.sol";
import "./InvestorLedger.sol";
import "../tokens/IToken.sol";


contract Loan {
    // Set only during begining phases and not changed afterwards
    uint256 public fundraisingBlocksCount;
    uint256 public paybackBlocksCount;

    // Contract changing state
    uint256 public fundraisingDeadline = 0;
    uint256 public paybackDeadline = 0;
    State   public currentState = State.CollateralCollection;
    
    using InvestorLedger for InvestorLedger.Ledger;
    InvestorLedger.Ledger ledger;   

    event FundraisingBegins(address indexed liege);
    event NewInvestment(address indexed liege, address indexed trustee);
    event FundraisingSucessfull(address indexed liege);
    event FundraisingFailed(address indexed liege);
    event LoanPaidback(address indexed liege);
    event LoanDefaulted(address indexed liege);

    modifier atState(State _state) {
        require(currentState == _state);

        _;
    }

    modifier timedTransitions() {
        if (currentState == State.Fundraising && fundraisingDeadline < block.number) {
            onFundraisingFail();
        } else if (currentState == State.Payback && paybackDeadline < block.number) {
            onPaybackFailure();
        }

        _;
    }

    function Loan(
        //IAtestor _atestator,
        IToken _collateralToken,
        IToken _loanToken,
        address _liege,
        uint256 _amountWanted,
        uint16  _interestPermil,
        uint256 _fundraisingBlocksCount,
        uint256 _paybackBlocksCount
    ) {
        //require(_atestator.isVerified(_liege));
        
        ledger = InvestorLedger.openAccount(
            _collateralToken,
            _loanToken,
            _liege,
            _amountWanted,
            _interestPermil
        );
        
        fundraisingBlocksCount = _fundraisingBlocksCount;
        paybackBlocksCount = _paybackBlocksCount;
    }

    function collateralToken() constant returns (IToken tokenAddress) {
        return ledger.collateralToken;
    }

    function borrowedToken() constant returns (IToken tokenAddress) {
        return ledger.loanToken;
    }

    function amountWanted() constant returns (uint256 _amountWanted) {
        return ledger.totalLoanNeeded;
    }

    function borrower() constant returns (address _borrower) {
        return ledger.liege;
    }

    function interestPermil() constant returns (uint16 _interestPermil) {
        return ledger.interestPermil;
    }

    function isFundraising() timedTransitions constant returns (bool _isFundraising) {
        return currentState == State.Fundraising;
    }

    function isPaidback() timedTransitions constant returns (bool _isPaidback) {
        return currentState == State.Finished && !ledger.loanDefaulted;
    }

    function isDefaulted() timedTransitions constant returns (bool _isDefaulted) {
        return currentState == State.Finished && ledger.loanDefaulted;
    }

    function getCurrentState() timedTransitions constant returns (uint _state) {
        return uint(currentState);
    }

    function amountGathered() constant returns (uint256 _totalAmount) {
        return ledger.totalAmountGathered;
    }

    function gatherCollateral() atState(State.CollateralCollection) {
        ledger.gatherCollateral();

        currentState = State.Fundraising;
        fundraisingDeadline = block.number + fundraisingBlocksCount;

        FundraisingBegins(ledger.liege);
    }

    function invest() timedTransitions atState(State.Fundraising) {
        ledger.gatherInvestment(msg.sender);

        NewInvestment(ledger.liege, msg.sender);

        if (ledger.isFullyFunded())
            onFundraisingSuccess();
    }

    function payback() timedTransitions atState(State.Payback) {
        ledger.gatherPayback();
        currentState = State.Finished;

        onPaybackSucess();
    }

    function widthrawInvestment() timedTransitions atState(State.Finished) {
        ledger.withdrawInvestment(msg.sender);
    }

    function withdrawLoan() timedTransitions atState(State.Payback) {
        ledger.releaseLoanToBorrower();
    }

    function onFundraisingSuccess() private {
        paybackDeadline = block.number + paybackBlocksCount;
        currentState = State.Payback;
        
        FundraisingSucessfull(ledger.liege);
    }

    function onFundraisingFail() private {
        ledger.markCancelled();
        currentState = State.Finished;

        FundraisingFailed(ledger.liege);
    }

    function onPaybackSucess() private {
        currentState = State.Finished;

        LoanPaidback(ledger.liege);
    }

    function onPaybackFailure() private {
        ledger.markDefaulted();
        currentState = State.Finished;

        LoanDefaulted(ledger.liege);
    }

    enum State {
        CollateralCollection,
        Fundraising,
        Payback,
        Finished
    }
}
