import Vue from 'vue'
import { MyLoansStateT, MyLoanT } from './types';

export const mutations = {
  'RECEIVE_MY_LOANS': function (state: MyLoansStateT, { loans }: { loans: MyLoanT[] }): void {
    state.myLoansList = loans;
    state.isLoading = false;
  },
  'REQUEST_MY_LOANS': function (state): void {
    state.isLoading = true;
  },
}