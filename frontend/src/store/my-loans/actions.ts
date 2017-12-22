import * as api from '../../api'
import { getMyBalance } from 'api/balance';
import { gatherCollateral, payback } from 'api';

export const GET_MY_LOANS_ACTION = "getMyLoansAction";
export const TRANSFER_COLLATERAL = "transferCollateral";
export const TRANSFER_PAYBACK_ACTION = "transferPayback";

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
  },
  [TRANSFER_PAYBACK_ACTION]({ commit }, payload: { shortId: string, onSuccess: () => void }) {
    (async function () {
      const { shortId, onSuccess } = payload;
      commit('START_TRANSFERING_PAYBACK', { shortId });
      await payback(shortId);
      commit('PAYBACK_TRANSFERED', { shortId });
      onSuccess();
    })();
  }
}

export default actions;