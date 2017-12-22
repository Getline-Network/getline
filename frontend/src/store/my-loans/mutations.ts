import Vue from 'vue'
import { MyLoansStateT, MyLoanT } from './types';

export const mutations = {
  'RECEIVE_MY_LOANS': function (state: MyLoansStateT, { loans }: { loans: MyLoanT[] }): void {
    state.myLoansList = loans;
    state.isLoading = false;
  },
  'REQUEST_MY_LOANS': function (state): void {
    state.isLoading = true;
  },
  'START_TRANSFERING_COLLATERAL': function (state: MyLoansStateT, { shortId }): void {
    state.myLoansList = state.myLoansList.map(loan => {
      if (loan.shortId == shortId) {
        return {
          ...loan,
          isTransferingCollateral: true
        }
      } else {
        return loan;
      }
    })
  },
  'COLLATERAL_TRANSFERED': function (state: MyLoansStateT, { shortId }): void {
    state.myLoansList = state.myLoansList.map(loan => {
      if (loan.shortId == shortId) {
        return {
          ...loan,
          isFundraising: true,
          isCollateralCollection: false,
          isTransferingCollateral: false
        }
      } else {
        return loan;
      }
    })
  },
  'START_TRANSFERING_PAYBACK': function (state: MyLoansStateT, { shortId }): void {
    state.myLoansList = state.myLoansList.map(loan => {
      if (loan.shortId == shortId) {
        return {
          ...loan,
          isTransferingPayback: true
        }
      } else {
        return loan;
      }
    })
  },
  'PAYBACK_TRANSFERED': function (state: MyLoansStateT, { shortId }): void {
    state.myLoansList = state.myLoansList.map(loan => {
      if (loan.shortId == shortId) {
        return {
          ...loan,
          isFundraising: false,
          isTransferingPayback: false,
          isCollateralCollection: false,
          isTransferingCollateral: false
        }
      } else {
        return loan;
      }
    })
  }
}