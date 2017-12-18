import * as api from '../../api'
import { getMyBalance } from '../account/actions';
import { gatherCollateral } from '../../api';

export const GET_MY_LOANS_ACTION = "getMyLoansAction";
export const TRANSFER_COLLATERAL = "transferCollateral";

const actions = {
  [GET_MY_LOANS_ACTION]({ commit }) {
    commit('REQUEST_MY_LOANS');
    api.getMyLoans(loans => {
      commit('RECEIVE_MY_LOANS', {
        loans
      })
    })
  },
  [TRANSFER_COLLATERAL]({ commit }, payload: { shortId: string, amount: string, onSuccess: () => void }) {
    (async function () {
      const { shortId, amount, onSuccess } = payload;
      commit('START_TRANSFERING_COLLATERAL', { shortId });
      const oldBalance: number = await getMyBalance();
      await gatherCollateral(shortId, amount);
      const newBalance: number = await getMyBalance();
      if (newBalance + parseInt(amount) == oldBalance) {
        commit('COLLATERAL_TRANSFERED', { shortId });
        onSuccess();
      } else {
        console.error('Error in transfering collateral');
      }
    })();
  }
}

export default actions;