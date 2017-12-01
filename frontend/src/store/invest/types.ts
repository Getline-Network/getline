export interface InvestStateT {
  loansToInvest: LoanToInvestT[];
  isLoading: boolean;
}

export interface LoanToInvestT {
  id: string;
  userName: string;
  userScore: string;
  amountNeeded: string;
  time: string;
  percentFunded: string;
  percentNeeded: string;
};

import { LoanState } from '../../../../getline.ts';
export { LoanState } from '../../../../getline.ts';