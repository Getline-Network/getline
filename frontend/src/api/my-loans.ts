import API, { LoanState, BigNumber, WithdrawalReason, Withdrawal } from './index';

import { MyLoanT } from 'store/my-loans';
import {
  getLoanTokenSymbols, getAmountsWanted, getAmountsInvested,
  getPaybackAmounts, getPossibleWithdrawals, getPossibleWithdrawalsAmounts, sum
} from './utils';

import { libraryWithdrawalsToView } from './withdrawal';

export async function getMyLoans(): Promise<MyLoanT[]> {
  const api = await API.instance();
  let currentUser = await api.currentUser();
  let libraryLoans = await api.loansByOwner(currentUser);
  const amountsInvested: BigNumber[] = await getAmountsInvested(libraryLoans);
  const amountsWanted: BigNumber[] = await getAmountsWanted(libraryLoans);
  const loanTokenSymbols: string[] = await getLoanTokenSymbols(libraryLoans);
  const paybackAmounts: BigNumber[] = await getPaybackAmounts(libraryLoans);

  // We cane have many possile withdrawals per loan
  const possibleWithdrawals: Withdrawal[][] = await getPossibleWithdrawals(libraryLoans);
  const possibleWithdrawalsAmount: BigNumber[][] = await getPossibleWithdrawalsAmounts(possibleWithdrawals);

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
      loanTokenSymbol: loanTokenSymbols[index],
      paybackAmount: paybackAmounts[index],
      isCollateralCollection: (loanState === LoanState.CollateralCollection),
      isFundraising: (loanState === LoanState.Fundraising),
      isPayback: (loanState === LoanState.Payback),
      withdrawalAmount: sum(possibleWithdrawalsAmount[index]),
      withdrawals: libraryWithdrawalsToView(possibleWithdrawals[index], possibleWithdrawalsAmount[index])
    }));
}
