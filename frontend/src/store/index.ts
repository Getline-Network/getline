import Vue from 'vue';
import Vuex from 'vuex';
import myLoans from './my-loans';
import { MyLoansStateT } from './my-loans/types'
Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    myLoans
  }
})

export interface StateT {
  myLoans: MyLoansStateT
}

export default store;