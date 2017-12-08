import Vue from 'vue';
import Vuex from 'vuex';
import myLoans from './my-loans';
import invest from './invest';
import account from './account';

import { MyLoansStateT } from './my-loans/types'
import { InvestStateT } from './invest/types'
import { AccountStateT } from './account/types'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    myLoans,
    invest,
    account
  }
})

export interface StateT {
  myLoans: MyLoansStateT;
  invest: InvestStateT;
  account: AccountStateT;
}

export default store;