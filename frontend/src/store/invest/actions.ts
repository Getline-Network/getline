import * as api from '../../api'

export const GET_LOANS_TO_INVEST_ACTION = "getLoansToInvestAction";

const actions = {
  [GET_LOANS_TO_INVEST_ACTION]({ commit }) {
    commit('REQUEST_LOANS_TO_INVEST');
    api.getLoansToInvest(loans => {
      commit('RECEIVE_LOANS_TO_INVEST', {
        loans
      })
    });
  }
}

export default actions;
