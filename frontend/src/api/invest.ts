import { BigNumber } from 'bignumber.js';

import API, { LoanState } from './index';
import { LoanToInvestT } from '@/store/invest/types';
import { getTokenSymbolsFromBlockchain, getAmountsWantedFromBlockchain, getAmountsGatheredFromBlockchain } from './utils';

export async function getLoansToInvest(cb) {
  const api = await API.instance();
  let currentUser = await api.currentUser();
  let blockchainLoans = await api.loansByState(LoanState.Fundraising);
  await Promise.all(blockchainLoans.map(loan => loan.updateStateFromBlockchain()));

  const amountsWanted: BigNumber[] = await getAmountsWantedFromBlockchain(blockchainLoans);
  const amountsGathered: BigNumber[] = await getAmountsGatheredFromBlockchain(blockchainLoans);
  const loanTokenSymbols: string[] = await getTokenSymbolsFromBlockchain(blockchainLoans);

  let loansToInvest: LoanToInvestT[] =
    blockchainLoans.map(({
      shortId,
      owner,
      parameters,
  }, index): LoanToInvestT => ({
        id: shortId,
        userName: owner.ascii,
        userScore: "A", // TODO Remove mock
        fundraisingDeadline: parameters.fundraisingDeadline.format('LL'),
        amountGathered: amountsGathered[index],
        amountWanted: amountsWanted[index],
        tokenSymbol: loanTokenSymbols[index]
      }));
  cb(loansToInvest);
}