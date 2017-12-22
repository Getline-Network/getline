import API from './index';

export async function payback(shortId: string) {
  const api = await API.instance();
  let loan = await api.loan(shortId);
  await loan.payback();
}