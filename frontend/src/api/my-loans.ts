import API, { LoanState } from './index';
import { BigNumber } from 'bignumber.js';

import { MyLoanT } from '../store/my-loans';

async function getTokenSymbolsFromBlockchain(loans): Promise<string[]> {
  const loanTokenSymbolPromises: Promise<string>[] =
    loans.map(({
      parameters: { loanToken }
    }) => loanToken.symbol());
  return Promise.all(loanTokenSymbolPromises);
}

async function getAmountsWantedFromBlockchain(loans): Promise<BigNumber[]> {
  const amountsWantedPromises: Promise<BigNumber>[] =
    loans.map(({
      parameters: { loanToken, amountWanted }
    }) => loanToken.humanize(amountWanted));
  return Promise.all(amountsWantedPromises);
}

async function getAmountsGatheredFromBlockchain(loans): Promise<BigNumber[]> {
  const amountsGatheredPromises: Promise<BigNumber>[] = loans.map(({
    parameters: { loanToken },
    blockchainState: { amountGathered }
  }) => loanToken.humanize(amountGathered));
  return Promise.all(amountsGatheredPromises);
}

export async function getMyLoans(cb) {
  const api = await API.instance();
  let currentUser = await api.currentUser();
  let blockchainLoans = await api.loansByOwner(currentUser);
  await Promise.all(blockchainLoans.map(loan => loan.updateStateFromBlockchain()));

  const amountsGathered: BigNumber[] = await getAmountsGatheredFromBlockchain(blockchainLoans);
  const amountsWanted: BigNumber[] = await getAmountsWantedFromBlockchain(blockchainLoans);
  const loanTokenSymbols: string[] = await getTokenSymbolsFromBlockchain(blockchainLoans);
  let viewLoans: MyLoanT[] =
    blockchainLoans.map(({
      shortId,
      description,
      parameters: { interestPermil },
      blockchainState: { loanState }
    }, index): MyLoanT => ({
        shortId,
        description,
        interestPermil,
        loanState,
        amountWanted: amountsWanted[index].toString(),
        amountGathered: amountsGathered[index].toString(),
        tokenSymbol: loanTokenSymbols[index],
        isCollateralCollection: (loanState === LoanState.CollateralCollection),
        isFundraising: (loanState === LoanState.Fundraising),
      }));
  cb(viewLoans);
}