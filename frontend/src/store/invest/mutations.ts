import Vue from 'vue'
import { InvestStateT, LoanToInvestT } from './types';

export const mutations = {
  'RECEIVE_LOANS_TO_INVEST': function (state: InvestStateT, { loans }: { loans: LoanToInvestT[] }): void {
    state.loansToInvest = loans;
    state.isLoading = false;
  },
  'REQUEST_LOANS_TO_INVEST': function (state): void {
    state.isLoading = true;
  },
}