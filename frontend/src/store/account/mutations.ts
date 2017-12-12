import Vue from 'vue'
import { AccountStateT } from './types';

export const mutations = {
  'RECEIVE_MY_BALANCE': function (state: AccountStateT, { balance, tokenName }: { balance: string, tokenName: string }): void {
    state.balance = balance;
    state.balanceToken = tokenName;
    state.isLoading = false;
  },
  'REQUEST_MY_BALANCE': function (state): void {
    state.isLoading = true;
  },
}