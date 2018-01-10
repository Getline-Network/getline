import { expect } from 'chai';
import { BigNumber } from 'api';

import { mutations } from '../src/store/account/mutations';
import { AccountStateT } from '../src/store/account/types';
import { } from 'jasmine'; // For describe(...) and it(...) types

describe('Loading account balance', () => {
  it('should get my balance', () => {
  const state: AccountStateT = { isLoading: false, loggedIn: true, balance: { balance: new BigNumber(0), tokenSymbol: "T", tokenName: "T", demoPrintValue: new BigNumber(0) }};

    mutations['REQUEST_MY_BALANCE'](state);
    expect(state.isLoading).to.equal(true)

    const newBalance = {
      balance: new BigNumber(12),
      tokenName: "ABCTOKEN",
      tokenSymbol: "ABC", 
      demoPrintValue: new BigNumber(1000),
    }
    mutations['RECEIVE_MY_BALANCE'](state, newBalance);

    expect(state.isLoading).to.equal(false)
    expect(state.balance).to.equal(newBalance);
  })
})
