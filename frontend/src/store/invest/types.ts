import { BigNumber } from 'bignumber.js/bignumber';
export interface InvestStateT {
  loansToInvest: LoanToInvestT[];
  isLoading: boolean;
}

export interface LoanToInvestT {
  id: string;
  userName: string;
  userScore: string;
  fundraisingDeadline: string;
  amountGathered: BigNumber;
  amountWanted: BigNumber;
  amountWantedWithToken?: string,
  tokenSymbol: string;

  percentageFunded?: string;
  percentageWanted?: string;
};

import { LoanState } from '../../../../getline.ts';
export { LoanState } from '../../../../getline.ts';