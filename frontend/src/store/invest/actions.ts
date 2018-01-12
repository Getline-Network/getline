import * as api from '../../api'

export const GET_LOANS_TO_INVEST_ACTION = "getLoansToInvestAction";
export const SORT_LOANS_TO_INVEST_ACTION = "sortLoansToInvestAction";
export const GET_LOAN_TO_INVEST_ACTION = "getLoanToInvestAction";
export const GET_MY_INVESTMENTS_ACTION = "getMyInvestments";

import { sortColumnT } from './types';

const actions = {
  [GET_LOANS_TO_INVEST_ACTION]({ commit }) {
    (async function () {
      commit('REQUEST_LOANS_TO_INVEST');
      try {
        commit('RECEIVE_LOANS_TO_INVEST', {
          loans: await api.getLoansToInvest()
        })
      } catch (e) {
        commit('REJECT_INVEST_REQUEST');
      }
    })();
  },
  [SORT_LOANS_TO_INVEST_ACTION]({ commit }, sortType: sortColumnT) {
    commit('SORT_LOANS_TO_INVEST', sortType)
  },
  [GET_LOAN_TO_INVEST_ACTION]({ commit }, { shortId }) {
    (async function () {
      commit('REQUEST_LOAN_TO_INVEST');
      try {
        commit('RECEIVE_LOAN_TO_INVEST', {
          loan: await api.getLoanToInvest(shortId)
        });
      } catch (e) {
        commit('REJECT_INVEST_REQUEST');
      }
    })()
  },
  [GET_MY_INVESTMENTS_ACTION]({ commit }) {
    (async function () {
      commit('REQUEST_MY_INVESTMENTS');
      try {
        commit('RECEIVED_MY_INVESTMENTS', {
          loans: await api.getMyInvestments()
        });
      } catch (e) {
        commit('REJECT_INVEST_REQUEST');
      }
    })()
  }
}

export default actions;
