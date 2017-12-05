import { BigNumber } from 'bignumber.js';

import API, { LoanState } from './index';
import { LoanToInvestT } from '@/store/invest/types';
import { getTokenSymbolsFromBlockchain, getAmountsWantedFromBlockchain, getAmountsGatheredFromBlockchain } from './utils';
import { getSingleAmountWantedFromBlockchain, getSingleAmountGatheredFromBlockchain, getSingleTokenSymbolFromBlockchain } from './utils';

export async function getLoansToInvest(cb: (loans: LoanToInvestT[]) => void): Promise<void> {
  const api = await API.instance();
  const currentUser = await api.currentUser();
  const blockchainLoans = await api.loansByState(LoanState.Fundraising);
  await Promise.all(blockchainLoans.map(loan => loan.updateStateFromBlockchain()));

  const amountsWanted: BigNumber[] = await getAmountsWantedFromBlockchain(blockchainLoans);
  const amountsGathered: BigNumber[] = await getAmountsGatheredFromBlockchain(blockchainLoans);
  const loanTokenSymbols: string[] = await getTokenSymbolsFromBlockchain(blockchainLoans);

  const loansToInvest: LoanToInvestT[] =
    blockchainLoans.map(({
      shortId,
      owner,
      parameters,
  }, index): LoanToInvestT => ({
        id: shortId,
        userName: owner.ascii,
        interestPermil: parameters.interestPermil,
        fundraisingDeadline: parameters.fundraisingDeadline.format('LL'),
        amountGathered: amountsGathered[index],
        amountWanted: amountsWanted[index],
        tokenSymbol: loanTokenSymbols[index]
      }));
  cb(loansToInvest);
}

export async function getLoanToInvest(shortId) {
  const api = await API.instance();
  let currentUser = await api.currentUser();
  let blockchainLoan = await api.loan(shortId);
  await blockchainLoan.updateStateFromBlockchain();

  const amountWanted: BigNumber = await getSingleAmountWantedFromBlockchain(blockchainLoan);
  const amountGathered: BigNumber = await getSingleAmountGatheredFromBlockchain(blockchainLoan);
  const tokenSymbol: string = await getSingleTokenSymbolFromBlockchain(blockchainLoan);
  let loan = {
    id: blockchainLoan.shortId,
    userName: blockchainLoan.owner.ascii,
    interestPermil: blockchainLoan.parameters.interestPermil,
    fundraisingDeadline: blockchainLoan.parameters.fundraisingDeadline.format('ll'),
    amountWanted,
    amountGathered,
    tokenSymbol,
  }
  return loan;
}