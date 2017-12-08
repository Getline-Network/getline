import API, { Loan } from './index';

export async function getMyBalance(cb: ({ balance, tokenName }: { balance: string, tokenName: string }) => void): Promise<void> {
  const api = await API.instance();
  const token = api.testToken;
  const user = await api.currentUser();
  const balance = (await token.balanceOf(user)).toString();
  const tokenName = await token.name();
  return cb({ balance, tokenName });
}
