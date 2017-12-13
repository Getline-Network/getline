import API, { Loan } from './index';

export async function getMyBalance(cb: ({ balance, tokenName, demoPrintValue }: { balance: string, tokenName: string, demoPrintValue: string }) => void): Promise<void> {
  const api = await API.instance();
  const token = api.testToken;
  const user = await api.currentUser();
  let [balance, tokenName, demoPrintValue] = await Promise.all([token.balanceOf(user), token.name(), token.printValue()]);
  return cb({
    balance: balance.toString(),
    tokenName,
    demoPrintValue: demoPrintValue.toString()
  });
}
