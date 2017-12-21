import API, { LoanState, BigNumber } from './index';

import { MyLoanT } from 'store/my-loans';
import { getTokenSymbolsFromBlockchain, getAmountsWantedFromBlockchain, getAmountsGatheredFromBlockchain } from './utils';

export async function getMyLoans(): Promise<MyLoanT[]> {
  const api = await API.instance();
  let currentUser = await api.currentUser();
  let libraryLoans = await api.loansByOwner(currentUser);
  await Promise.all(libraryLoans.map(loan => loan.updateStateFromBlockchain()));

  const amountsGathered: BigNumber[] = await getAmountsGatheredFromBlockchain(libraryLoans);
  const amountsWanted: BigNumber[] = await getAmountsWantedFromBlockchain(libraryLoans);
  const loanTokenSymbols: string[] = await getTokenSymbolsFromBlockchain(libraryLoans);
  return libraryLoans.map(({
    shortId,
    description,
    parameters: { interestPermil },
    blockchainState: { loanState }
    }, index): MyLoanT => ({
      shortId,
      description,
      interestPermil,
      loanState,
      amountWanted: amountsWanted[index],
      amountGathered: amountsGathered[index],
      tokenSymbol: loanTokenSymbols[index],
      isCollateralCollection: (loanState === LoanState.CollateralCollection),
      isFundraising: (loanState === LoanState.Fundraising),
    }));
}
