import * as moment from "moment";
import { BigNumber } from 'api';
import { withdrawalT } from 'store/my-loans/types';

export interface InvestStateT {
  loansToInvest: LoanToInvestT[];
  isLoading: boolean;
  activeLoan: LoanToInvestT | {};
  pendingInvestments: LoanToInvestT[];
  activeInvestments: LoanToInvestT[];
  finishedInvestments: LoanToInvestT[];
  errorReceiving: boolean;
}

export interface LoanToInvestT {
  id: string;
  userName: string;
  fundraisingDeadline: moment.Moment;
  amountInvested: BigNumber;
  collateralReceived: BigNumber;
  amountWanted: BigNumber;
  amountWantedWithToken?: string,
  loanTokenSymbol: string;
  collateralTokenSymbol: string;
  interestPermil: number;
  percentageFunded?: number;
  percentageWanted?: number;
  isLoading?: boolean;
  description?: string;
  loanState?: number;
  withdrawals?: withdrawalT[];
  withdrawalAmount?: BigNumber;
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
