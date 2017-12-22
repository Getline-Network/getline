import API, { Loan, BigNumber } from './index';
import * as moment from 'moment';

export async function requestLoan(amount: number, interestPermil: number, paybackTime: number, description: string) {
  const api = await API.instance();
  const token = api.testToken;
  const fundraisingEnd: moment.Moment = moment().add(7, 'days');
  const paybackEnd: moment.Moment = moment().add(7 + paybackTime, 'days');
  await api.newLoan(
    description,
    await token.integerize(new BigNumber(amount)),
    interestPermil,
    fundraisingEnd,
    paybackEnd
  );
}
