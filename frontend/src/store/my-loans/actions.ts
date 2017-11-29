import * as api from '../../api'
import * as types from './mutation-types'

export const GET_MY_LOANS = "getMyLoans";

const actions = {
  [GET_MY_LOANS]({ commit }) {
    commit(types.START_LOADING_MY_LOANS);
    api.getMyLoans(loans => {
      commit(types.RECEIVE_MY_LOANS, {
        loans
      })
    })
  }
}

export default actions;