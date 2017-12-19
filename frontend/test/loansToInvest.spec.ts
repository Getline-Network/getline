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

const mockLoan2: LoanToInvestT = {
  ...mockLoan1,
  id: '2',
  userName: 'Rodney WrightA',
  fundraisingDeadline: moment().add(2, 'days'),
  amountGathered: new BigNumber("40"),
  amountWanted: new BigNumber("51"),
}

const mockLoan3: LoanToInvestT = {
  ...mockLoan1,
  id: '3',
  userName: 'Rodney WrightC',
  fundraisingDeadline: moment().add(3, 'days'),
  amountGathered: new BigNumber("1"),
  amountWanted: new BigNumber("10"),
}

const mockLoans = [mockLoan1, mockLoan2, mockLoan3];

describe('Loans to invest list', () => {
  it('Should get loans to invest', () => {
    const state: InvestStateT = { loansToInvest: [], isLoading: false, activeLoan: {} };

    mutations['REQUEST_LOANS_TO_INVEST'](state);
    expect(state.isLoading).to.equal(true)

    mutations['RECEIVE_LOANS_TO_INVEST'](state, { loans: [mockLoan1] });
    expect(state.isLoading).to.equal(false)
    const loan: LoanToInvestT = state.loansToInvest[0];
    expect(loan.percentageFunded).to.equal(60);
    expect(loan.percentageWanted).to.equal(40);
  })

  it('Should sort loans to invest by amount wanted', () => {
    const state: InvestStateT = { loansToInvest: mockLoans, isLoading: false, activeLoan: {} };
    const sortType1: sortColumnT = {
      name: 'AMOUNT_WANTED',
      type: 'asc'
    }
    mutations['SORT_LOANS_TO_INVEST'](state, sortType1);
    let { loansToInvest } = state;
    expect(loansToInvest[0].amountWanted.equals(new BigNumber("10"))).to.equal(true);
    expect(loansToInvest[1].amountWanted.equals(new BigNumber("50"))).to.equal(true);
    expect(loansToInvest[2].amountWanted.equals(new BigNumber("51"))).to.equal(true);

    const sortType2: sortColumnT = {
      name: 'AMOUNT_WANTED',
      type: 'desc'
    }
    mutations['SORT_LOANS_TO_INVEST'](state, sortType2);
    loansToInvest = state.loansToInvest;
    expect(loansToInvest[0].amountWanted.equals(new BigNumber("51"))).to.equal(true);
    expect(loansToInvest[1].amountWanted.equals(new BigNumber("50"))).to.equal(true);
    expect(loansToInvest[2].amountWanted.equals(new BigNumber("10"))).to.equal(true);
  })

  it('Should sort loans to invest by fundraising deadline', () => {
    const state: InvestStateT = { loansToInvest: mockLoans, isLoading: false, activeLoan: {} };
    const sortType1: sortColumnT = {
      name: 'TIME',
      type: 'asc'
    }
    mutations['SORT_LOANS_TO_INVEST'](state, sortType1);
    let { loansToInvest } = state;
    expect(loansToInvest[0].fundraisingDeadline.unix() < loansToInvest[1].fundraisingDeadline.unix()).to.equal(true)
    expect(loansToInvest[1].fundraisingDeadline.unix() < loansToInvest[2].fundraisingDeadline.unix()).to.equal(true)

    const sortType2: sortColumnT = {
      name: 'TIME',
      type: 'desc'
    }
    mutations['SORT_LOANS_TO_INVEST'](state, sortType2);
    loansToInvest = state.loansToInvest;
    expect(loansToInvest[0].fundraisingDeadline.unix() > loansToInvest[1].fundraisingDeadline.unix()).to.equal(true)
    expect(loansToInvest[1].fundraisingDeadline.unix() > loansToInvest[2].fundraisingDeadline.unix()).to.equal(true)
  })

  it('Should sort loans to invest by user name', () => {
    const state: InvestStateT = { loansToInvest: mockLoans, isLoading: false, activeLoan: {} };
    const sortType1: sortColumnT = {
      name: 'NAME',
      type: 'asc'
    }
    mutations['SORT_LOANS_TO_INVEST'](state, sortType1);
    let { loansToInvest } = state;
    expect(loansToInvest[0].userName < loansToInvest[1].userName).to.equal(true)
    expect(loansToInvest[1].userName < loansToInvest[2].userName).to.equal(true)

    const sortType2: sortColumnT = {
      name: 'NAME',
      type: 'desc'
    }
    mutations['SORT_LOANS_TO_INVEST'](state, sortType2);
    loansToInvest = state.loansToInvest;
    expect(loansToInvest[0].userName > loansToInvest[1].userName).to.equal(true)
    expect(loansToInvest[1].userName > loansToInvest[2].userName).to.equal(true)
  })

  it('Should sort loans to invest by percentage funded', () => {
    const state: InvestStateT = { loansToInvest: mockLoans, isLoading: false, activeLoan: {} };
    const sortType1: sortColumnT = {
      name: 'FUNDED',
      type: 'asc'
    }
    mutations['SORT_LOANS_TO_INVEST'](state, sortType1);
    let { loansToInvest } = state;
    expect(loansToInvest[0].id).to.equal('3');
    expect(loansToInvest[1].id).to.equal('1');
    expect(loansToInvest[2].id).to.equal('2');

    const sortType2: sortColumnT = {
      name: 'FUNDED',
      type: 'desc'
    }
    mutations['SORT_LOANS_TO_INVEST'](state, sortType2);
    loansToInvest = state.loansToInvest;
    expect(loansToInvest[0].id).to.equal('2');
    expect(loansToInvest[1].id).to.equal('1');
    expect(loansToInvest[2].id).to.equal('3');
  })

  it('Should sort loans to invest by percentage needed', () => {
    const state: InvestStateT = { loansToInvest: mockLoans, isLoading: false, activeLoan: {} };
    const sortType1: sortColumnT = {
      name: 'NEEDED',
      type: 'asc'
    }
    mutations['SORT_LOANS_TO_INVEST'](state, sortType1);
    let { loansToInvest } = state;
    expect(loansToInvest[0].id).to.equal('2');
    expect(loansToInvest[1].id).to.equal('1');
    expect(loansToInvest[2].id).to.equal('3');

    const sortType2: sortColumnT = {
      name: 'NEEDED',
      type: 'desc'
    }
    mutations['SORT_LOANS_TO_INVEST'](state, sortType2);
    loansToInvest = state.loansToInvest;
    expect(loansToInvest[0].id).to.equal('3');
    expect(loansToInvest[1].id).to.equal('1');
    expect(loansToInvest[2].id).to.equal('2');
  })
})
