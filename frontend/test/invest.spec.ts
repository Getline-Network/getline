import { expect } from 'chai';
import { BigNumber } from '../src/api';
import * as moment from "moment";
import { } from 'jasmine'; // For describe(...) and it(...) types

import { mutations } from '../src/store/invest/mutations';
import { InvestStateT, LoanToInvestT, sortColumnT } from '../src/store/invest/types';

const mockLoan1: LoanToInvestT = {
  id: '1',
  userName: 'Rodney WrightB',
  interestPermil: 500,
  fundraisingDeadline: moment().add(1, 'days'),
  amountGathered: new BigNumber("30"),
  amountWanted: new BigNumber("50"),
  tokenSymbol: "BTC"
};


describe('Loading loan to invest', () => {
  it('Should start loading single loan', () => {
    const state: InvestStateT = { loansToInvest: [], isLoading: false, activeLoan: {} };

    mutations['REQUEST_LOAN_TO_INVEST'](state);
    let activeLoan: LoanToInvestT = <LoanToInvestT>state.activeLoan;
    expect(activeLoan.isLoading).to.equal(true)

    mutations['RECEIVE_LOAN_TO_INVEST'](state, { loan: mockLoan1 });
    activeLoan = <LoanToInvestT>state.activeLoan;
    expect(activeLoan.isLoading).to.equal(false)
    expect(activeLoan.interestPermil).to.equal(500);
  })
  it('Should invest in loan', () => {
    const state: InvestStateT = { loansToInvest: [], isLoading: false, activeLoan: mockLoan1 };

    mutations['INVEST_IN_LOAN'](state, 10);
    let activeLoan: LoanToInvestT = <LoanToInvestT>state.activeLoan;
    expect(activeLoan.isInvesting).to.equal(true)
  })
})
