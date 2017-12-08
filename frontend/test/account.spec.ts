import { expect } from 'chai';

import { mutations } from '../src/store/account/mutations';
import { AccountStateT } from '../src/store/account/types';
import { } from 'jasmine'; // For describe(...) and it(...) types

describe('mutations', () => {
  it('Should get loans to invest', () => {
    const state: AccountStateT = { balance: "", isLoading: false, balanceToken: "T" };

    mutations['REQUEST_MY_BALANCE'](state);
    expect(state.isLoading).to.equal(true)

    mutations['RECEIVE_MY_BALANCE'](state, { balance: "12", tokenName: "ABCTOKEN" });
    expect(state.isLoading).to.equal(false)
    const bal: string = state.balance;
    const tokenName: string = state.balanceToken;
    expect(bal).to.equal("12");
    expect(tokenName).to.equal("ABCTOKEN");
  })
})
