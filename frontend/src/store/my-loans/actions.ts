import * as api from '../../api'

export const GET_MY_LOANS_ACTION = "getMyLoansAction";

const actions = {
  [GET_MY_LOANS_ACTION]({ commit }) {
    commit('REQUEST_MY_LOANS');
    api.getMyLoans(loans => {
      commit('RECEIVE_MY_LOANS', {
        loans
      })
    })
  }
}

export default actions;