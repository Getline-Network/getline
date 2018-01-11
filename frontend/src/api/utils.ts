import { BigNumber } from './index';
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

export async function getPaybackAmounts(loans: Loan[]): Promise<BigNumber[]> {
  const paybacks: BigNumber[] = await Promise.all(loans.map(loan => loan.paybackRequired()));

  return Promise.all(loans.map((loan, index) => {
    const { parameters: { loanToken } } = loan;
    return loanToken.humanize(paybacks[index]);
  }));
}
