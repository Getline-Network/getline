import API, { Loan } from './index';
import { BalanceT } from 'store/account/types';

export async function getMyBalance(): Promise<BalanceT> {
  const api = await API.instance();
  const token = api.testToken;
  const user = await api.currentUser();
  let [balance, tokenName, tokenSymbol, demoPrintValue] = await Promise.all([token.balanceOf(user), token.name(), token.symbol(), token.printValue()]);
  return ({
    balance: await token.humanize(balance),
    tokenName,
    tokenSymbol,
    demoPrintValue: await token.humanize(demoPrintValue)
  });
}
