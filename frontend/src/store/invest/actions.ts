import * as api from '../../api'

export const GET_LOANS_TO_INVEST_ACTION = "getLoansToInvestAction";
export const SORT_LOANS_TO_INVEST_ACTION = "sortLoansToInvestAction";
export const GET_LOAN_TO_INVEST_ACTION = "getLoanToInvestAction";

import { sortColumnT } from './types';

const actions = {
  [GET_LOANS_TO_INVEST_ACTION]({ commit }) {
    commit('REQUEST_LOANS_TO_INVEST');
    api.getLoansToInvest(loans => {
      commit('RECEIVE_LOANS_TO_INVEST', {
        loans
      })
    });
  },
  [SORT_LOANS_TO_INVEST_ACTION]({ commit }, sortType: sortColumnT) {
    commit('SORT_LOANS_TO_INVEST', sortType)
  },
  [GET_LOAN_TO_INVEST_ACTION]({ commit }, { shortId }) {
    commit('REQUEST_LOAN_TO_INVEST');
    api.getLoanToInvest(shortId, loan => {
      commit('RECEIVE_LOAN_TO_INVEST', {
        loan
      })
    });
  },
}

export default actions;
