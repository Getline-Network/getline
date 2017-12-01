import { BigNumber } from 'bignumber.js';

export async function getAmountsWantedFromBlockchain(loans): Promise<BigNumber[]> {
  const amountsWantedPromises: Promise<BigNumber>[] =
    loans.map(({
      parameters: { loanToken, amountWanted }
    }) => loanToken.humanize(amountWanted));
  return Promise.all(amountsWantedPromises);
}

export async function getAmountsGatheredFromBlockchain(loans): Promise<BigNumber[]> {
  const amountsGatheredPromises: Promise<BigNumber>[] = loans.map(({
    parameters: { loanToken },
    blockchainState: { amountGathered }
  }) => loanToken.humanize(amountGathered));
  return Promise.all(amountsGatheredPromises);
}

export async function getTokenSymbolsFromBlockchain(loans): Promise<string[]> {
  const loanTokenSymbolPromises: Promise<string>[] =
    loans.map(({
      parameters: { loanToken }
    }) => loanToken.symbol());
  return Promise.all(loanTokenSymbolPromises);
}
