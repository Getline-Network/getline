import Vue from 'vue'
import { AccountStateT } from './types';

export const mutations = {
  'RECEIVE_MY_BALANCE': function (state: AccountStateT, { balance, tokenName, demoPrintValue }: { balance: string, tokenName: string, demoPrintValue: string }): void {
    state.balance = balance;
    state.balanceTokenName = tokenName;
    state.demoPrintValue = demoPrintValue;
    state.isLoading = false;
    state.errorReceivingBalance = false;
  },
  'REQUEST_MY_BALANCE': function (state: AccountStateT): void {
    state.isLoading = true;
  },
  'REJECT_MY_BALANCE': function (state: AccountStateT): void {
    state.errorReceivingBalance = true;
    state.isLoading = false;
  },
  'SET_LOGGED_IN_VIEW': function (state: AccountStateT): void {
    state.loggedIn = true;
  }
}