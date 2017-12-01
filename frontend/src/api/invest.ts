export async function getLoansToInvest(cb) {
  /** TODO Connect to the getline.ts
   * import API, { LoanState } from './index';
   *
   * const api = await API.instance();
   * let currentUser = await api.currentUser();
   * let stateMap = await api.loansByState();
   * return stateMap[LoanState.Fundraising
   */
  setTimeout(function () {
    cb([mockLoan, mockLoan]);
  }, 1000);
}

const mockLoan = {
  id: 1,
  userName: 'Rodney Wright',
  userScore: 'A',
  amountNeeded: '123.45 USD',
  time: '1 Month',
  percentFunded: '47%',
  percentNeeded: '53%',
};