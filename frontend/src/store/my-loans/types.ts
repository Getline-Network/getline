import { BigNumber } from 'api';

export interface MyLoansStateT {
  myLoansList: MyLoanT[];
  isLoading: boolean;
}

export interface MyLoanT {
  // Data received immediately.
  shortId: string;
  description: string;
  interestPermil: number;
  loanState: LoanState;

  // Data from promises.
  amountGathered?: BigNumber;
  amountWanted?: BigNumber;
  isCollateralCollection?: boolean;
  isTransferingCollateral?: boolean;
  isFundraising?: boolean;
  tokenSymbol?: string;
};

import { LoanState } from '../../../../getline.ts';
export { LoanState } from '../../../../getline.ts';