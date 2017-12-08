import actions from './actions';
import { mutations } from './mutations';
import { AccountStateT } from './types';

const state: AccountStateT = {
  balance: '',
  balanceToken: '',
  isLoading: false,
}

export default {
  state,
  actions,
  mutations,
};
