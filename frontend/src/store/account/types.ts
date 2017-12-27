import { BigNumber } from 'api';

export interface AccountStateT {
  balance: string,
  balanceTokenName: string,
  demoPrintValue: string,
  isLoading: boolean;
  loggedIn: boolean;
  errorReceivingBalance: boolean;
}

export interface BalanceT {
  balance: BigNumber;
  tokenName: string;
  demoPrintValue: BigNumber;
}