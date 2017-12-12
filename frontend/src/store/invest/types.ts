import { BigNumber } from '@/api/index';

export interface InvestStateT {
  loansToInvest: LoanToInvestT[];
  isLoading: boolean;
}

export interface LoanToInvestT {
  id: string;
  userName: string;
  fundraisingDeadline: string;
  amountGathered: BigNumber;
  amountWanted: BigNumber;
  amountWantedWithToken?: string,
  tokenSymbol: string;
  interestPermil: number;
  percentageFunded?: string;
  percentageWanted?: string;
};

import { LoanState } from '../../../../getline.ts';
export { LoanState } from '../../../../getline.ts';
