import { BigNumber } from './index';
import { Loan } from 'api';

export async function getAmountsWantedFromBlockchain(loans): Promise<BigNumber[]> {
  const amountsWantedPromises: Promise<BigNumber>[] =
    loans.map(getSingleAmountWantedFromBlockchain);
  return Promise.all(amountsWantedPromises);
}

export async function getAmountsGatheredFromBlockchain(loans): Promise<BigNumber[]> {
  const amountsGatheredPromises: Promise<BigNumber>[] =
    loans.map(getSingleAmountGatheredFromBlockchain);
  return Promise.all(amountsGatheredPromises);
}

export async function getTokenSymbolsFromBlockchain(loans): Promise<string[]> {
  const loanTokenSymbolPromises: Promise<string>[] =
    loans.map(getSingleTokenSymbolFromBlockchain);
  return Promise.all(loanTokenSymbolPromises);
}

export async function getPayBackAmountFromBlockchain(loans: Loan[]): Promise<BigNumber[]> {
  const paybacks: BigNumber[] = await Promise.all(loans.map(loan => loan.paybackAmount()));

  return Promise.all(loans.map((loan, index) => {
    const { parameters: { loanToken } } = loan;
    return loanToken.humanize(paybacks[index]);
  }));
}

export async function getSingleAmountWantedFromBlockchain(loan): Promise<BigNumber> {
  const {
    parameters: { loanToken, amountWanted }
  } = loan;
  return loanToken.humanize(amountWanted);
}

export async function getSingleAmountGatheredFromBlockchain(loan): Promise<BigNumber> {
  const {
    parameters: { loanToken, amountWanted },
    blockchainState: { amountGathered }
  } = loan;
  return loanToken.humanize(amountGathered);
}

export async function getSingleTokenSymbolFromBlockchain(loan): Promise<string> {
  const {
    parameters: { loanToken }
  } = loan;
  return loanToken.symbol();
}


