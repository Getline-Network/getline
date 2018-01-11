import { BigNumber } from 'api';

export interface MyLoansStateT {
  myLoansList: MyLoanT[];
  isLoading: boolean;
  errorReceiving: boolean;
}

export interface MyLoanT {
  // Data received immediately.
  shortId: string;
  description: string;
  interestPermil: number;
  loanState: LoanState;

  // Data from promises.
  amountInvested?: BigNumber;
  amountWanted?: BigNumber;
  paybackAmount?: BigNumber;

  // collateral collection
  isCollateralCollection?: boolean;
  isTransferingCollateral?: boolean;

  isFundraising?: boolean;

  // payback
  isPayback?: boolean;
  isTransferingPayback?: boolean;

  //finished
  isFinished?: boolean;

  loanTokenSymbol?: string;
};

import { LoanState } from '../../../../getline.ts';
export { LoanState } from '../../../../getline.ts';
