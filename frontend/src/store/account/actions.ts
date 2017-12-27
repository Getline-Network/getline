import * as api from '../../api'

export const GET_MY_BALANCE_ACTION = "getMyBalanceAction";
export const SET_LOGGED_IN_VIEW_ACTION = "notLoggedInView";

const actions = {
  [GET_MY_BALANCE_ACTION]({ commit }) {
    (async function () {
      commit('REQUEST_MY_BALANCE');
      try {
        commit('RECEIVE_MY_BALANCE', await api.getMyBalance());
      } catch (e) {
        commit('REJECT_MY_BALANCE');
      }
    })();
  },
  [SET_LOGGED_IN_VIEW_ACTION]({ commit }) {
    commit('SET_LOGGED_IN_VIEW');
  }
}

export default actions;