export interface MyLoansStateT {
  myLoansList: MyLoanT[];
  isLoading: boolean;
}

export interface MyLoanT {
  // Data received immediately.
  description: string;
  interestPermil: number;
  loanState: LoanState;

  // Data from promises.
  amountGathered?: string;
  amountWanted?: string;
  isCollateralCollection?: boolean;
  isFundraising?: boolean;
  tokenSymbol?: string;
};

import { LoanState } from '../../../../getline.ts';