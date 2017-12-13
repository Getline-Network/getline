import Vue from 'vue'
import { BigNumber } from 'bignumber.js/bignumber';
import * as moment from "moment";

import { InvestStateT, LoanToInvestT, sortColumnT, sorterT } from './types';

export const mutations = {
  'RECEIVE_LOANS_TO_INVEST': function (state: InvestStateT, { loans }: { loans: LoanToInvestT[] }): void {
    state.loansToInvest = loans.map(extendLoan)
    state.isLoading = false;
  },
  'REQUEST_LOANS_TO_INVEST': function (state: InvestStateT): void {
    state.isLoading = true;
  },
  'SORT_LOANS_TO_INVEST': function (state: InvestStateT, byColumn: sortColumnT): void {
    state.loansToInvest.sort(getSortCmp(byColumn));
  }
}

function getSortCmp(column: sortColumnT): sorterT {
  const sortType: string = column.type;
  function reverseIfDesc(sub: number): number {
    return sortType == 'asc' ? sub : -sub;
  }
  switch (column.name) {
    case "AMOUNT_WANTED":
      return function (a: LoanToInvestT, b: LoanToInvestT): number {
        const sub = a.amountWanted.sub(b.amountWanted).toNumber();
        return reverseIfDesc(sub)
      }

    case "TIME":
      return function (a: LoanToInvestT, b: LoanToInvestT): number {
        const sub = a.fundraisingDeadline.unix() - b.fundraisingDeadline.unix();
        return reverseIfDesc(sub);
      }

    case "FUNDED":
      return function (a: LoanToInvestT, b: LoanToInvestT): number {
        const percentageA = getPercentageFunded(a);
        const percentageB = getPercentageFunded(b);
        const sub = percentageA - percentageB;
        return reverseIfDesc(sub);
      }

    case "NEEDED":
      return function (a: LoanToInvestT, b: LoanToInvestT): number {
        const percentageA = getPercentageWanted(a);
        const percentageB = getPercentageWanted(b);
        const sub = percentageA - percentageB;
        return reverseIfDesc(sub);
      }

    case "NAME":
      return function (a: LoanToInvestT, b: LoanToInvestT): number {
        let sub = 0;
        if (a.userName < b.userName) {
          sub = -1
        }
        if (a.userName > b.userName) {
          sub = 1
        }
        return reverseIfDesc(sub);
      }
    default:
      // Just in case
      return function (a: LoanToInvestT, b: LoanToInvestT): number {
        return reverseIfDesc(a < b ? -1 : 1);
      }

  }
}

function extendLoan(loan: LoanToInvestT): LoanToInvestT {
  return {
    ...loan,
    amountWantedWithToken: loan.amountWanted.toString() + " " + loan.tokenSymbol,
    percentageFunded: getPercentageFunded(loan),
    percentageWanted: getPercentageWanted(loan),
  }
}

function getPercentageFunded(loan: LoanToInvestT): number {
  return loan.amountGathered.times(100).dividedBy(loan.amountWanted).toNumber();
}

function getPercentageWanted(loan: LoanToInvestT): number {
  return (new BigNumber(100)).sub(loan.amountGathered.times(100).dividedBy(loan.amountWanted)).toNumber();
}
