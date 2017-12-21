import API, { BigNumber, LoanState, Loan } from './index';
import { LoanToInvestT } from 'store/invest/types';
import { getTokenSymbolsFromBlockchain, getAmountsWantedFromBlockchain, getAmountsGatheredFromBlockchain } from './utils';
import { getSingleAmountWantedFromBlockchain, getSingleAmountGatheredFromBlockchain, getSingleTokenSymbolFromBlockchain } from './utils';

export async function getLoansToInvest(): Promise<LoanToInvestT[]> {
  const api = await API.instance();
  const currentUser = await api.currentUser();
  const libraryLoans = await api.loansByState(LoanState.Fundraising);
  await Promise.all(libraryLoans.map(loan => loan.updateStateFromBlockchain()));

  const amountsWanted: BigNumber[] = await getAmountsWantedFromBlockchain(libraryLoans);
  const amountsGathered: BigNumber[] = await getAmountsGatheredFromBlockchain(libraryLoans);
  const loanTokenSymbols: string[] = await getTokenSymbolsFromBlockchain(libraryLoans);

  return libraryLoans.map(({
    shortId,
    owner,
    parameters,
  }, index): LoanToInvestT => ({
      id: shortId,
      userName: owner.ascii,
      interestPermil: parameters.interestPermil,
      fundraisingDeadline: parameters.fundraisingDeadline,
      amountGathered: amountsGathered[index],
      amountWanted: amountsWanted[index],
      tokenSymbol: loanTokenSymbols[index]
    }));
}

export async function getLoanToInvest(shortId: string): Promise<LoanToInvestT> {
  const api = await API.instance();
  let currentUser = await api.currentUser();
  let blockchainLoan = await api.loan(shortId);
  await blockchainLoan.updateStateFromBlockchain();
  return await libraryLoanToViewLoan(blockchainLoan);
}

export async function investInLoan(shortId: string, amount: number): Promise<void> {
  const api = await API.instance();
  const testToken = api.testToken;
  let currentUser = await api.currentUser();
  let loan = await api.loan(shortId);
  await loan.invest(await testToken.integerize(new BigNumber(amount)));
}

export async function getMyInvestments(): Promise<LoanToInvestT[]> {
  const api = await API.instance();
  let user = await api.currentUser();
  let libraryLoans = await api.loansByOwner(user);
  await Promise.all(libraryLoans.map(loan => loan.updateStateFromBlockchain()));
  return await Promise.all(libraryLoans.map(libraryLoanToViewLoan));
}

async function libraryLoanToViewLoan(libraryLoan: Loan): Promise<LoanToInvestT> {
  const amountWanted: BigNumber = await getSingleAmountWantedFromBlockchain(libraryLoan);
  const amountGathered: BigNumber = await getSingleAmountGatheredFromBlockchain(libraryLoan);
  const tokenSymbol: string = await getSingleTokenSymbolFromBlockchain(libraryLoan);
  return {
    id: libraryLoan.shortId,
    userName: libraryLoan.owner.ascii,
    interestPermil: libraryLoan.parameters.interestPermil,
    fundraisingDeadline: libraryLoan.parameters.fundraisingDeadline,
    amountGathered: amountGathered,
    amountWanted: amountWanted,
    tokenSymbol,
    description: libraryLoan.description,
    loanState: libraryLoan.blockchainState.loanState
  }
}
