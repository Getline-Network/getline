import API, { LoanState } from './index';
import { BigNumber } from 'bignumber.js';

import { MyLoanT } from '../store/my-loans';
import { getTokenSymbolsFromBlockchain, getAmountsWantedFromBlockchain, getAmountsGatheredFromBlockchain } from './utils';

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
      description,
      parameters: { interestPermil },
      blockchainState: { loanState }
    }, index): MyLoanT => ({
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