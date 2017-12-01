import { expect } from 'chai';
import { mutations } from '../src/store/invest/mutations';
import { InvestStateT, LoanToInvestT } from '../src/store/invest/types';
import { } from 'jasmine'; // For describe(...) and it(...) types

const mockLoan: LoanToInvestT = {
  id: "1",
  userName: 'Rodney Wright',
  userScore: 'A',
  amountNeeded: '123.45 USD',
  time: '1 Month',
  percentFunded: '47%',
  percentNeeded: '53%',
};

describe('mutations', () => {
  it('Should receive loans', () => {
    const state: InvestStateT = { loansToInvest: [], isLoading: false };

    mutations['REQUEST_LOANS_TO_INVEST'](state);
    expect(state.isLoading).to.equal(true)

    mutations['RECEIVE_LOANS_TO_INVEST'](state, { loans: [mockLoan] });
    expect(state.isLoading).to.equal(false)
    expect(state.loansToInvest[0].userScore).to.equal("A");
  })
})
