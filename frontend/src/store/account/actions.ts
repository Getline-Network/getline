import * as api from '../../api'

export const GET_MY_BALANCE_ACTION = "getMyBalanceAction";

const actions = {
  [GET_MY_BALANCE_ACTION]({ commit }) {
    commit('REQUEST_MY_BALANCE');
    api.getMyBalance(({ balance, tokenName, demoPrintValue }: { balance: string, tokenName: string, demoPrintValue: string }) => {
      commit('RECEIVE_MY_BALANCE', {
        balance, tokenName, demoPrintValue
      })
    })
  }
}

export function getMyBalance(): Promise<number> {
  return new Promise(function (resolve, reject) {
    api.getMyBalance(({ balance }: { balance: string }) => {
      resolve(parseInt(balance));
    })
  });
}

export default actions;