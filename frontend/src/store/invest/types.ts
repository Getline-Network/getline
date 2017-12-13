import { BigNumber } from 'bignumber.js/bignumber';
import * as moment from "moment";
export interface InvestStateT {
  loansToInvest: LoanToInvestT[];
  isLoading: boolean;
}

export interface LoanToInvestT {
  id: string;
  userName: string;
  fundraisingDeadline: moment.Moment;
  amountGathered: BigNumber;
  amountWanted: BigNumber;
  amountWantedWithToken?: string,
  tokenSymbol: string;
  interestPermil: number;
  percentageFunded?: number;
  percentageWanted?: number;
};

export interface sortColumnT {
  name: string; // in DOM md-table-head.md-sorty-by
  type: string; // 'asc' or 'desc'
}

import { LoanState } from '../../../../getline.ts';
export { LoanState } from '../../../../getline.ts';