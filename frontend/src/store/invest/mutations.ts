import Vue from 'vue'
import { BigNumber } from 'bignumber.js/bignumber';

import { InvestStateT, LoanToInvestT } from './types';

export const mutations = {
  'RECEIVE_LOANS_TO_INVEST': function (state: InvestStateT, { loans }: { loans: LoanToInvestT[] }): void {
    state.loansToInvest = loans.map(extendLoan)
    state.isLoading = false;
  },
  'REQUEST_LOANS_TO_INVEST': function (state): void {
    state.isLoading = true;
  },
}

function extendLoan(loan: LoanToInvestT): LoanToInvestT {
  return {
    ...loan,
    amountWantedWithToken: loan.amountWanted.toString() + " " + loan.tokenSymbol,
    percentageFunded: getPercentageFunded(loan.amountGathered, loan.amountWanted),
    percentageWanted: getPercentageWanted(loan.amountGathered, loan.amountWanted),
  }
}

function getPercentageFunded(amountGathered: BigNumber, amountWanted: BigNumber): string {
  const percentage = amountGathered.times(100).dividedBy(amountWanted);
  return percentage + "%"
}

function getPercentageWanted(amountGathered: BigNumber, amountWanted: BigNumber): string {
  const percentage = (new BigNumber(100)).sub(amountGathered.times(100).dividedBy(amountWanted));
  return percentage + "%"
}
