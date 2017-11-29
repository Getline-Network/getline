import Vue from 'vue'
import * as types from './mutation-types'

export default {
  [types.RECEIVE_MY_LOANS](state, { loans }) {
    state.myLoansList = loans;
    state.isLoading = false;
  },
  [types.START_LOADING_MY_LOANS](state) {
    state.isLoading = true;
  },
}