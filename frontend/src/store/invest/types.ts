import * as moment from "moment";
import { BigNumber } from '@/api';

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

export interface sorterT {
  (a: LoanToInvestT, b: LoanToInvestT): number;
}

import { LoanState } from '../../../../getline.ts';
export { LoanState } from '../../../../getline.ts';
