import { expect } from 'chai';
import { BigNumber } from '../src/api';
import * as moment from "moment";
import { } from 'jasmine'; // For describe(...) and it(...) types

import { mutations } from '../src/store/invest/mutations';
import { LoanState, InvestStateT, LoanToInvestT, sortColumnT } from '../src/store/invest/types';

const mockLoan1: LoanToInvestT = {
  id: '1',
  userName: 'Rodney WrightB',
  interestPermil: 500,
  fundraisingDeadline: moment().add(1, 'days'),
  amountGathered: new BigNumber("30"),
  amountWanted: new BigNumber("50"),
  tokenSymbol: "BTC",
  loanState: LoanState.Payback
};

const mockLoan2: LoanToInvestT = {
  ...mockLoan1,
  id: '2',
  loanState: LoanState.Finished
};

const mockLoan3: LoanToInvestT = {
  ...mockLoan1,
  id: '3',
  loanState: LoanState.Fundraising
};

const initialState = {
  loansToInvest: [],
  isLoading: false,
  activeLoan: {},
  pendingInvestments: [],
  activeInvestments: [],
  finishedInvestments: [],
  errorReceiving: false
}

describe('Invest', () => {
  it('Should start loading single loan', () => {
    const state: InvestStateT = { ...initialState }

    mutations['REQUEST_LOAN_TO_INVEST'](state);
    let activeLoan: LoanToInvestT = <LoanToInvestT>state.activeLoan;
    expect(activeLoan.isLoading).to.equal(true)

    mutations['RECEIVE_LOAN_TO_INVEST'](state, { loan: mockLoan1 });
    activeLoan = <LoanToInvestT>state.activeLoan;
    expect(activeLoan.isLoading).to.equal(false)
    expect(activeLoan.interestPermil).to.equal(500);
  })
  it('Should load my investments', () => {
    const state: InvestStateT = { ...initialState };

    mutations['REQUEST_MY_INVESTMENTS'](state);
    expect(state.isLoading).to.equal(true)

    mutations['RECEIVED_MY_INVESTMENTS'](state, { loans: [mockLoan1, mockLoan2, mockLoan3] });
    expect(state.isLoading).to.equal(false)
    expect(state.pendingInvestments.length).to.equal(1);
    expect(state.activeInvestments.length).to.equal(1);
    expect(state.finishedInvestments.length).to.equal(1);
  })
})
