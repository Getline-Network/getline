import * as api from '../../api'

export const GET_MY_BALANCE_ACTION = "getMyBalanceAction";
export const SET_LOGGED_IN_VIEW_ACTION = "notLoggedInView";

const actions = {
  [GET_MY_BALANCE_ACTION]({ commit }) {
    commit('REQUEST_MY_BALANCE');
    api.getMyBalance(({ balance, tokenName, demoPrintValue }: { balance: string, tokenName: string, demoPrintValue: string }) => {
      commit('RECEIVE_MY_BALANCE', {
        balance, tokenName, demoPrintValue
      })
    })
  },
  [SET_LOGGED_IN_VIEW_ACTION]({ commit }) {
    commit('SET_LOGGED_IN_VIEW');
  }
}

export function getMyBalance(): Promise<number> {
  return new Promise(function (resolve, reject) {
    try {
      api.getMyBalance(({ balance }: { balance: string }) => {
        resolve(parseInt(balance));
      });
    } catch (e) {
      return reject('Error occurred while receiving balance: ' + e);
    }
  });
}

export default actions;