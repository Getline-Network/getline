import API, { Loan, BigNumber } from './index';
import * as moment from 'moment';

export async function requestLoan(amount: number, interestPermil: number, paybackTime: number, description: string) {
  const api = await API.instance();
  const token = api.testToken;
  const fundraisingDelta = 7 * 24 * 3600; // 7 days
  const paybackDelta = paybackTime * 24 * 3600;
  await api.newLoan(
    description,
    await token.integerize(new BigNumber(amount)),
    interestPermil,
    fundraisingDelta,
    paybackDelta
  );
}
