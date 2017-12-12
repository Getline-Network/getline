import API, { Loan } from './index';

export async function printMeDemoTokens() {
  const api = await API.instance();
  const token = api.testToken;
  const user = await api.currentUser();
  await token.print(user);
}

