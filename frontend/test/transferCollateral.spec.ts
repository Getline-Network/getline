import { expect } from 'chai';
import { mutations } from '../src/store/my-loans/mutations';
import { BigNumber } from '../src/api';
import { MyLoansStateT, MyLoanT, LoanState } from '../src/store/my-loans/types';
import { } from 'jasmine'; // For describe(...) and it(...) types

const mockLoan1: MyLoanT = {
  shortId: "123",
  description: "desc",
  interestPermil: 12,
  loanState: LoanState.Finished,
  amountGathered: new BigNumber(1),
  amountWanted: new BigNumber(2),
  isCollateralCollection: false,
  isFundraising: true,
}

const mockLoan2: MyLoanT = {
  ...mockLoan1,
  shortId: "124"
}

describe('Transfering collateral', () => {
  it('Should start transfering collateral', () => {
    const state: MyLoansStateT = { myLoansList: [mockLoan1, mockLoan2], isLoading: false, errorReceiving: false };
    mutations['START_TRANSFERING_COLLATERAL'](state, { shortId: "123" });
    expect(state.myLoansList[0].isTransferingCollateral).to.equal(true);
    expect(state.myLoansList[1].isTransferingCollateral).not.to.equal(true);
  });
  it('Should receive collateral', () => {
    const state: MyLoansStateT = { myLoansList: [mockLoan1, mockLoan2], isLoading: false, errorReceiving: false };
    mutations['COLLATERAL_TRANSFERED'](state, { shortId: "124" });
    expect(state.myLoansList[1].isFundraising).to.equal(true);
    expect(state.myLoansList[1].isCollateralCollection).to.equal(false);
    expect(state.myLoansList[1].isTransferingCollateral).to.equal(false);
  });
})
