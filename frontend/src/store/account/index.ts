import actions from './actions';
import { mutations } from './mutations';
import { AccountStateT } from './types';
import { BigNumber } from 'api';

const state: AccountStateT = {
  balance: {
    balance: new BigNumber(0),
    tokenName: "",
    tokenSymbol: "",
    demoPrintValue: new BigNumber(0),
  },
  isLoading: false,
  loggedIn: false
}

export default {
  state,
  actions,
  mutations,
};
