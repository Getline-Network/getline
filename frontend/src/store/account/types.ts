import { BigNumber } from 'api';

export interface AccountStateT {
  balance: BalanceT,
  isLoading: boolean;
  loggedIn: boolean;
  errorReceivingBalance: boolean;
}

export interface BalanceT {
  balance: BigNumber;
  tokenName: string;
  tokenSymbol: string;
  demoPrintValue: BigNumber;
}
