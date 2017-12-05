import { expect } from 'chai';
import { BigNumber } from 'bignumber.js';

import { mutations } from '../src/store/invest/mutations';
import { InvestStateT, LoanToInvestT } from '../src/store/invest/types';
import { } from 'jasmine'; // For describe(...) and it(...) types

const mockLoan: LoanToInvestT = {
  id: '1',
  userName: 'Rodney Wright',
  interestPermil: 500,
  fundraisingDeadline: 'today',
  amountGathered: new BigNumber("30"),
  amountWanted: new BigNumber("50"),
  tokenSymbol: "BTC"
};

describe('mutations', () => {
  it('Should get loans to invest', () => {
    const state: InvestStateT = { loansToInvest: [], isLoading: false };

    mutations['REQUEST_LOANS_TO_INVEST'](state);
    expect(state.isLoading).to.equal(true)

    mutations['RECEIVE_LOANS_TO_INVEST'](state, { loans: [mockLoan] });
    expect(state.isLoading).to.equal(false)
    const loan: LoanToInvestT = state.loansToInvest[0];
    expect(loan.percentageFunded).to.equal("60%");
    expect(loan.percentageWanted).to.equal("40%");
  })
})
