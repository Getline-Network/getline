import * as api from '../../api'
import { getMyBalance } from 'api/balance';
import { gatherCollateral } from '../../api';

export const GET_MY_LOANS_ACTION = "getMyLoansAction";
export const TRANSFER_COLLATERAL = "transferCollateral";

const actions = {
  [GET_MY_LOANS_ACTION]({ commit }) {
    (async function () {
      commit('REQUEST_MY_LOANS');
      commit('RECEIVE_MY_LOANS', { loans: await api.getMyLoans() });
    })();
  },
  [TRANSFER_COLLATERAL]({ commit }, payload: { shortId: string, amount: string, onSuccess: () => void }) {
    (async function () {
      const { shortId, amount, onSuccess } = payload;
      commit('START_TRANSFERING_COLLATERAL', { shortId });
      await gatherCollateral(shortId, amount);
      commit('COLLATERAL_TRANSFERED', { shortId });
      onSuccess();
    })();
  }
}

export default actions;