import API, { LoanState, BigNumber } from './index';

import { MyLoanT } from 'store/my-loans';
import { getLoanTokenSymbols, getAmountsWanted, getAmountsInvested,
         getPaybackAmounts } from './utils';

export async function getMyLoans(): Promise<MyLoanT[]> {
  const api = await API.instance();
  let currentUser = await api.currentUser();
  let libraryLoans = await api.loansByOwner(currentUser);
  const amountsInvested: BigNumber[] = await getAmountsInvested(libraryLoans);
  const amountsWanted: BigNumber[] = await getAmountsWanted(libraryLoans);
  const loanTokenSymbols: string[] = await getLoanTokenSymbols(libraryLoans);
  const paybackAmounts: BigNumber[] = await getPaybackAmounts(libraryLoans);

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
      amountInvested: amountsInvested[index],
      tokenSymbol: loanTokenSymbols[index],
      paybackAmount: paybackAmounts[index],
      isCollateralCollection: (loanState === LoanState.CollateralCollection),
      isFundraising: (loanState === LoanState.Fundraising),
      isPayback: (loanState === LoanState.Payback),
      isFinished: (loanState === LoanState.Finished)
    }));
}
