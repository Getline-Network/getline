import { LoanState, BigNumber, Withdrawal } from './index';
import { Loan } from 'api';

export async function getAmountsWanted(loans: Loan[]): Promise<BigNumber[]> {
  return Promise.all(loans.map((l) => l.parameters.loanToken.humanize(l.parameters.amountWanted)));
}

export async function getAmountsInvested(loans: Loan[]): Promise<BigNumber[]> {
  return Promise.all(loans.map((l) => l.parameters.loanToken.humanize(l.blockchainState.amountInvested)));
}

export async function getCollateralsReceived(loans: Loan[]): Promise<BigNumber[]> {
  return Promise.all(loans.map((l) => l.parameters.collateralToken.humanize(l.blockchainState.collateralReceived)));
}

export async function getLoanTokenSymbols(loans: Loan[]): Promise<string[]> {
  return Promise.all(loans.map((l) => l.parameters.loanToken.symbol()));
}

export async function getCollateralTokenSymbols(loans: Loan[]): Promise<string[]> {
  return Promise.all(loans.map((l) => l.parameters.collateralToken.symbol()));
}

export async function getPossibleWithdrawals(loans: Loan[]): Promise<Withdrawal[][]> {
  return Promise.all(loans.map(loan => loan.possibleWithdrawals()));
}

export async function getPossibleWithdrawalsAmounts(withdrawals: Withdrawal[][]): Promise<BigNumber[][]> {
  return Promise.all(
    withdrawals.map(withdrawalsPerLoan =>
      Promise.all(withdrawalsPerLoan.map(({ token, amount }) => token.humanize(amount))))
  );
}

export function sum(bigNumbers: BigNumber[]): BigNumber {
  return bigNumbers.reduce((acc, value) => value.add(acc), new BigNumber(0));
}

export async function getPaybackAmounts(loans: Loan[]): Promise<BigNumber[]> {
  const paybacks: BigNumber[] = await Promise.all(loans.map(loan => loan.paybackRequired()));

  return Promise.all(loans.map((loan, index) => {
    const { parameters: { loanToken } } = loan;
    return loanToken.humanize(paybacks[index]);
  }));
}
