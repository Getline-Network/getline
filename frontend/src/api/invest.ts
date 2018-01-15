import API, { BigNumber, LoanState, Loan, Withdrawal } from './index';
import { LoanToInvestT } from 'store/invest/types';
import { libraryWithdrawalsToView } from './withdrawal';
import {
  getLoanTokenSymbols, getCollateralTokenSymbols, getAmountsWanted,
  getAmountsInvested, getCollateralsReceived, getPossibleWithdrawals, getPossibleWithdrawalsAmounts, sum,
} from './utils';

export async function getLoansToInvest(): Promise<LoanToInvestT[]> {
  const api = await API.instance();
  const currentUser = await api.currentUser();
  const libraryLoans = await api.loansByState(LoanState.Fundraising);

  const amountsWanted: BigNumber[] = await getAmountsWanted(libraryLoans);
  const amountsInvested: BigNumber[] = await getAmountsInvested(libraryLoans);
  const collateralsReceived: BigNumber[] = await getCollateralsReceived(libraryLoans);
  const loanTokenSymbols: string[] = await getLoanTokenSymbols(libraryLoans);
  const collateralTokenSymbols: string[] = await getCollateralTokenSymbols(libraryLoans);

  return libraryLoans.map(({
    shortId,
    owner,
    parameters,
    blockchainState,
  }, index): LoanToInvestT => ({
      id: shortId,
      userName: owner.ascii,
      interestPermil: parameters.interestPermil,
      fundraisingDeadline: blockchainState.fundraisingDeadline,
      amountInvested: amountsInvested[index],
      collateralReceived: collateralsReceived[index],
      amountWanted: amountsWanted[index],
      loanTokenSymbol: loanTokenSymbols[index],
      collateralTokenSymbol: collateralTokenSymbols[index]
    }));
}

export async function getLoanToInvest(shortId: string): Promise<LoanToInvestT> {
  const api = await API.instance();
  let currentUser = await api.currentUser();
  let blockchainLoan = await api.loan(shortId);
  await blockchainLoan.updateStateFromBlockchain();
  return await libraryLoanToViewLoan(blockchainLoan, [], []);
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
  let libraryLoans = await api.loansByInvestor(user);

  // We cane have many possile withdrawals per investemnt
  const possibleWithdrawals: Withdrawal[][] = await getPossibleWithdrawals(libraryLoans);
  const possibleWithdrawalsAmount: BigNumber[][] = await getPossibleWithdrawalsAmounts(possibleWithdrawals);

  return await Promise.all(libraryLoans.map((loan, ind) => libraryLoanToViewLoan(loan, possibleWithdrawals[ind], possibleWithdrawalsAmount[ind])));
}

async function libraryLoanToViewLoan(libraryLoan: Loan, loanWithdrawals: Withdrawal[], loanWithdrawalAmounts: BigNumber[]): Promise<LoanToInvestT> {
  const loanT = libraryLoan.parameters.loanToken;
  const collateralT = libraryLoan.parameters.collateralToken;

  const amountWanted = await loanT.humanize(libraryLoan.parameters.amountWanted);
  const amountInvested = await loanT.humanize(libraryLoan.blockchainState.amountInvested);
  const collateralReceived = await collateralT.humanize(libraryLoan.blockchainState.collateralReceived);
  return {
    id: libraryLoan.shortId,
    userName: libraryLoan.owner.ascii,
    interestPermil: libraryLoan.parameters.interestPermil,
    fundraisingDeadline: libraryLoan.blockchainState.fundraisingDeadline,
    amountInvested: amountInvested,
    collateralReceived: collateralReceived,
    amountWanted: amountWanted,
    description: libraryLoan.description,
    loanState: libraryLoan.blockchainState.loanState,
    loanTokenSymbol: await loanT.symbol(),
    collateralTokenSymbol: await collateralT.symbol(),
    withdrawalAmount: sum(loanWithdrawalAmounts),
    withdrawals: libraryWithdrawalsToView(loanWithdrawals, loanWithdrawalAmounts)
  }
}
