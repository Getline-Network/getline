import Vue from 'vue'
import { AccountStateT, BalanceT } from './types';

export const mutations = {
  'RECEIVE_MY_BALANCE': function (state: AccountStateT, balance: BalanceT): void {
    state.balance = balance;
    state.isLoading = false;
  },
  'REQUEST_MY_BALANCE': function (state): void {
    state.isLoading = true;
  },
  'SET_LOGGED_IN_VIEW': function (state): void {
    state.loggedIn = true;
  }
}
