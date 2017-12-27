import actions from './actions';
import { mutations } from './mutations';
import { MyLoansStateT } from './types';

const state: MyLoansStateT = {
  myLoansList: [],
  isLoading: false,
  errorReceiving: false
}

export default {
  state,
  actions,
  mutations,
};

export { MyLoanT } from './types';