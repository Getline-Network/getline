import Vue from 'vue'
import { AccountStateT, BalanceT } from './types';

export const mutations = {
  'RECEIVE_MY_BALANCE': function (state: AccountStateT, balance: BalanceT): void {
    state.balance = balance;
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
