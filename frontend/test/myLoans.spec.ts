import { expect } from 'chai';
import { mutations } from '../src/store/my-loans/mutations';
import { MyLoansStateT, MyLoanT, LoanState } from '../src/store/my-loans/types';
import { } from 'jasmine'; // For describe(...) and it(...) types

const mockLoan: MyLoanT = {
  shortId: "123",
  description: "desc",
  interestPermil: 12,
  loanState: LoanState.Finished,
  amountGathered: "1",
  amountWanted: "2",
  isCollateralCollection: false,
  isFundraising: true,
}

describe('mutations', () => {
  it('Should receive loans', () => {
    const state: MyLoansStateT = { myLoansList: [], isLoading: false };

    mutations['REQUEST_MY_LOANS'](state);
    expect(state.isLoading).to.equal(true)

    mutations['RECEIVE_MY_LOANS'](state, { loans: [mockLoan] });
    expect(state.isLoading).to.equal(false)
    expect(state.myLoansList[0].description).to.equal("desc");
  })
})
