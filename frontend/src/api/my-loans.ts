import API, { LoanState, BigNumber } from './index';
import { WithdrawalByTokenT, MyLoanT } from 'store/my-loans/types';
import {
  getLoanTokenSymbols, getAmountsWanted, getAmountsInvested,
  getPaybackAmounts, getPossibleWithdrawalAmountsByToken
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

  // We cane have many possible withdrawals per loan
  const possibleWithdrawalsAmountsByToken: WithdrawalByTokenT[][] = await getPossibleWithdrawalAmountsByToken(libraryLoans);

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
      withdrawals: libraryWithdrawalsToView(possibleWithdrawalsAmountsByToken[index])
    }));
}
