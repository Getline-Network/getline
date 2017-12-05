import Vue from 'vue';
import Vuex from 'vuex';
import myLoans from './my-loans';
import invest from './invest';
import { MyLoansStateT } from './my-loans/types'
import { InvestStateT } from './invest/types'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    myLoans,
    invest
  }
})

export interface StateT {
  myLoans: MyLoansStateT;
  invest: InvestStateT;
}

export default store;