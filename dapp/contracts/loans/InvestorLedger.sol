pragma solidity ^0.4.17;

import "../tokens/IToken.sol";
import "../common/Math.sol";

library InvestorLedger {
    event StateTransistion(
        address indexed loan,
        State from,
        State to
    );
    event NewInvestor(
        address indexed loan,
        address indexed investor
    );

    event InvestmentSent(
        address indexed loan,
        address indexed investor,
        uint256 amount
    );

    uint constant PERMIL = 1000;

    enum State {
        // Loan is waiting for collateral to be received from borrower.
        CollateralCollection,
        // Loan is waiting to be funded by investors.
        Fundraising,
        // Loan is waiting for withdrawal from borrower.
        Payback,
        // Loan has been paid back succesfully and is waiting for investors
        // to withdraw their investments and the borrower to withdraw their
        // collateral.
        Paidback,
        // Loan has defaulted before it has been fully paid back, and is
        // waiting for investors to withdraw their collateral.
        Defaulted,
        // Loan has been cancelled by borrower or has not gathered funds in
        // time, and is waiting for investors to withdraw their investments
        // and the borrower to withdraw their collateral.
        Canceled,
        // Loan has no funds left and is fully finished.
        Finished
    }

    // legalTransition is a safeguard function to be used in functions that
    // modify the Ledger state. It is not checked when the state does not
    // change (so all A -> A transitions are implicitly allowed).
    function legalTransition(State from, State to) pure private returns (bool legal) {
        // No switch statements in Solidity. We'll use a bunch of if-else
        // blocks, as the alternative is handcrafted assembly.
        if (from == State.CollateralCollection) {
            // Loan has collected collateral.
            if (to == State.Fundraising) {
                return true;
            }
            return false;
        }
        if (from == State.Fundraising) {
            // Loan has raised funds succesfully.
            if (to == State.Payback) {
                return true;
            }
            // Loan has not raised funds succesfully - let borrower and
            // investors (if any) collect their tokens back.
            if (to == State.Canceled) {
                return true;
            }
            return false;
        }
        if (from == State.Payback) {
            // Loan has been paid back successfully.
            if (to == State.Paidback) {
                return true;
            }
            // Loan has defaulted.
            if (to == State.Defaulted) {
                return true;
            }
            return false;
        }
        if (from == State.Paidback) {
            // Loan has had all collateral and investments withdrawn.
            if (to == State.Finished) {
                return true;
            }
            // Loan has still tokens left to withdraw.
            if (to == State.Paidback) {
                return true;
            }
            return false;
        }
        if (from == State.Defaulted) {
            // Loan has had all collateral and investments withdrawn.
            if (to == State.Finished) {
                return true;
            }
            // Loan has still tokens left to withdraw.
            if (to == State.Defaulted) {
                return true;
            }
            return false;
        }
        if (from == State.Canceled) {
            // Loan has had all collateral and investments withdrawn.
            if (to == State.Finished) {
                return true;
            }
            // Loan has still tokens left to withdraw.
            if (to == State.Canceled) {
                    return true;
            }
            return false;
        }

        return false;
    }


    // newState applies a state transition to the ledger FSM and ensures it is
    // legal.
    function newState(Ledger storage ledger, State next) private {
        require(legalTransition(ledger.state, next));
        ledger.state = next;
    }

    // Ledger is the main state object of an ongoing loan ledger.
    struct Ledger {
        /// Constant ledger parameters.
        // Token used as collateral.
        IToken collateralToken;
        // Main loan Token.
        IToken loanToken;
        // Receiver of the loan.
        address borrower;
        // How much loanToken does borrower want to borrow.
        uint256 amountWanted;
        // Interst of loan in permils.
        uint16  interestPermil;
        // Delta (in seconds) between collateral collected and fundraising ending.
        uint64 fundraisingDelta;
        // Delta (in seconds)  between fundraising ending and payback needed.
        uint64 paybackDelta;

        /// Mutable ledger state.
        // Total collateralToken gathered for loan. It increases from 0 to
        // the loan collateral when its' gathered.
        uint256 receivedCollateral;
        // List of investor addresses to key investorData.
        address[] investors;
        // Data about each investor. It gets upserted any time a new investment
        // is added.
        mapping(address => InvestorData) investorData;
        // Absolute timestamp of fundraising deadline, in block time (seconds).
        // Calculated when we switch to the fundraising state.
        uint64 fundraisingDeadline;
        // Absolute timestamp of payback deadline, in block time (seconds).
        // Calculated when we switch to the payback state.
        uint64 paybackDeadline;

        /// Main ledger FSM state.
        State state;
    }

    struct InvestorData {
        uint256 amountInvested;
    }

    /// View functions for the Ledger structure that calculate denormalized
    /// data based on investment status.
    
    // totalAmountInvested() returns how much was invested into this loan in
    // total by all investors (not counting interest rate).
    function totalAmountInvested(Ledger storage ledger) view public returns (uint256 amount) {
        amount = 0;
        for (uint i = 0; i < ledger.investors.length; i++ ) {
            var investor = ledger.investorData[ledger.investors[i]];
            amount += investor.amountInvested;
        }
        return amount;
    }

    // amountInvested(address) returns how much was invested into this loan by
    // a particular address.
    function amountInvested(Ledger storage ledger, address investor) view public returns (uint256 amount) {
        return ledger.investorData[investor].amountInvested;
    }

    // paybackRequired returns how much payback is/will be required for this
    // loan (loan amount + interest).
    function paybackRequired(Ledger storage ledger) view public returns (uint256 amount) {
        return ledger.amountWanted + calculateInterest(ledger, ledger.amountWanted);
    }

    // calculateInterest is a convenience function to calculate the interest
    // of this loan on a given value.
    function calculateInterest(Ledger storage ledger, uint256 investment) view private returns (uint256 interest) {
        return investment * ledger.interestPermil / PERMIL;
    }

    // openAccount is a static constructor of the Ledger state object.
    // @param collateralToken: Token to be used as collateral during the loan.
    // @param loanToken: Token to be loaned.
    // @param borrower: Receiver of the loan.
    // @param totalLoanNeded: How much loanToken does borrower want to borrow.
    // @param interestPermil: Loan interest, in permil (1/10th of a percent).
    function openAccount(
        IToken collateralToken,
        IToken loanToken,
        address borrower,
        uint256 amountWanted,
        uint16 interestPermil,
        uint64 fundraisingDelta,
        uint64 paybackDelta) internal view returns (Ledger account)
    {
        // Argument validation.
        require(fundraisingDelta > 0);
        require(paybackDelta > 0);
        require(amountWanted > 0);
        require(block.timestamp + fundraisingDelta + paybackDelta > block.timestamp);
        require(block.timestamp + fundraisingDelta + paybackDelta > block.timestamp + fundraisingDelta);

        // Fill new state object.
        account.collateralToken = collateralToken;
        account.loanToken = loanToken;
        account.amountWanted = amountWanted;
        account.interestPermil = interestPermil;
        account.borrower = borrower;
        account.state = State.CollateralCollection;
        account.fundraisingDelta = fundraisingDelta;
        account.paybackDelta = paybackDelta;
        account.fundraisingDeadline = 0;
        account.paybackDeadline = 0;

        // And return it.
        return account;
    }

    // collateralCollectionProcess performs processing within the
    // CollateralCollection state of the loan FSM and possibly advances to its'
    // next state. It can:
    //  - mark the loan as Finished if the fundraising deadline is exceeded
    //    (no tokens have been transfered to the contract, so we can close it
    //    right away)
    //  - collect the collateral from the borrower and mark the loan as
    //    Fundraising (the loan now has a collateral it needs to send back)
    function collateralCollectionProcess(Ledger storage ledger, address caller) public {
        require(ledger.state == State.CollateralCollection);
        // Only allow borrower to perform the state transition, otherwise we
        // could permit races where a malicious actor performs the state
        // transition when the borrower is not ready to do so.
        if (caller == ledger.borrower) {
            var allowance = ledger.collateralToken.allowance(ledger.borrower, this);
            if (allowance > 0) {
                uint64 timestamp = uint64(block.timestamp);
                ledger.receivedCollateral += allowance;
                newState(ledger, State.Fundraising);
                ledger.fundraisingDeadline = timestamp + ledger.fundraisingDelta;
                require(ledger.fundraisingDeadline > timestamp);
                require(ledger.fundraisingDeadline + ledger.paybackDelta > ledger.fundraisingDeadline);

                require(
                    ledger.collateralToken.transferFrom(
                        ledger.borrower,
                        this,
                        allowance
                    )
                );
            }
        }
    }

    function fundraisingProcess(Ledger storage ledger, address caller) public {
        require(ledger.state == State.Fundraising);

        // Have we ran out of time?
        if (block.timestamp > ledger.fundraisingDeadline) {
            newState(ledger, State.Canceled);
        } else {
            uint256 amountNeeded = ledger.amountWanted - totalAmountInvested(ledger);
            address investor = caller;
            // Do not invest more than required to fullfill amountWanted.
            var investmentAmount = Math.min(
                ledger.loanToken.allowance(investor, this),
                amountNeeded
            );
            if (investmentAmount > 0) {
                uint64 timestamp = uint64(block.timestamp);
                var investorData = ledger.investorData[investor];
                if (investorData.amountInvested == 0) {
                    NewInvestor(this, investor);
                    ledger.investors.push(investor);
                }
                // Note down the investment.
                require(investorData.amountInvested + investmentAmount > investorData.amountInvested);
                investorData.amountInvested += investmentAmount;
                // Did we just gather all investments required?
                if (investmentAmount == amountNeeded) {
                    newState(ledger, State.Payback);
                    ledger.paybackDeadline = timestamp + ledger.paybackDelta;
                }
                // Transfer the investment to the receiving contract.
                InvestmentSent(this, investor, investmentAmount);
                require(
                    ledger.loanToken.transferFrom(
                        investor,
                        this,
                        investmentAmount
                    )
                );
                // If this was the last required invesment, transfer all the
                // invested money to the borrower.
                if (investmentAmount == amountNeeded) {
                    require(
                        ledger.loanToken.transfer(
                            ledger.borrower,
                            ledger.amountWanted
                        )
                    );
                }
            }
        }
    }

    function paybackProcess(Ledger storage ledger, address caller) public {
        require(ledger.state == State.Payback);

        // Have we ran out of time?
        if (block.timestamp > ledger.paybackDeadline) {
            newState(ledger, State.Defaulted);
        } else if (caller == ledger.borrower)  {
            // Gather payback, if possible.
            uint256 payback = paybackRequired(ledger);
            if (ledger.loanToken.allowance(ledger.borrower, this) >= payback) {
                newState(ledger, State.Paidback);
                require(
                    ledger.loanToken.transferFrom(
                        ledger.borrower,
                        this,
                        payback
                    )
                );
            }
        }
    }

    function paidbackProcess(Ledger storage ledger) public {
        require(ledger.state == State.Paidback);
        newState(ledger, State.Finished);

        // Send the collateral back to the borrower.
        require(
            ledger.collateralToken.transfer(
                ledger.borrower,
                ledger.receivedCollateral
            )
        );
        // Send the investments (with interest) back to the investors.
        for (uint i = 0; i < ledger.investors.length; i++ ) {
            address investor = ledger.investors[i];
            uint256 invested = ledger.investorData[investor].amountInvested;
            require(
                ledger.loanToken.transfer(
                    investor,
                    invested + calculateInterest(ledger, invested)
                )
            );
        }
    }

    function defaultedProcess(Ledger storage ledger) public {
        require(ledger.state == State.Defaulted);
        newState(ledger, State.Finished);

        // Send the collateral, prorated over the investment amount by each
        // investor.
        uint256 totalInvested = totalAmountInvested(ledger);
        for (uint i = 0; i < ledger.investors.length; i++) {
            address investor = ledger.investors[i];
            uint256 invested = ledger.investorData[investor].amountInvested;
            uint256 collateralBack = (ledger.receivedCollateral * invested) / totalInvested;
            require(
                ledger.collateralToken.transfer(
                    investor,
                    collateralBack
                )
            );
        }
    }

    function canceledProcess(Ledger storage ledger) public {
        require(ledger.state == State.Canceled);
        newState(ledger, State.Finished);

        // Send the collateral back to the borrower.
        require(
            ledger.collateralToken.transfer(
                ledger.borrower,
                ledger.receivedCollateral
            )
        );
        // Send the investments back to the investors.
        for (uint i = 0; i < ledger.investors.length; i++ ) {
            address investor = ledger.investors[i];
            uint256 invested = ledger.investorData[investor].amountInvested;
            require(
                ledger.loanToken.transfer(
                    investor,
                    invested
                )
            );
        }
    }
}
