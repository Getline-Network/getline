<template>
  <div class="my-loans-spinner" v-if="isLoading">
    <spinner />
  </div>
  <div v-else class="my-loans">
    <div class="ml-loans-container">
      <loan-tile v-for="loan in loans" :key="loan.shortId" :loan="loan" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Spinner from '../common/Spinner.vue';
import MyLoanTile from './MyLoanTile.vue';
import API, {Loan, LoanState} from '../../api';
import {BigNumber} from 'bignumber.js';

interface ViewLoan {
  // Data received immediately.
  description: string;
  interestPermil: number;
  loanState: LoanState;

  // Data from promises.
  amountGathered?: string;
  amountWanted?: string;
  isCollateralCollection?: boolean;
  isFundraising?: boolean;
  tokenSymbol?: string;
};

const Component = Vue.extend({
  name: 'MyLoans',
  components: {
    'loan-tile': MyLoanTile,
    'spinner': Spinner,
  },
  created() {
    (async () => {
      this.isLoading = true;
      const api = await API.instance();

      let currentUser = await api.currentUser();
      let loans = await api.loansByOwner(currentUser);
      await Promise.all(loans.map(loan => loan.updateStateFromBlockchain()));
      let _loans = loans.map(({
        description,
        parameters: {interestPermil},
        blockchainState: {loanState}
      }): ViewLoan => ({
        description,
        interestPermil,
        loanState,
      }));

      const amountsWantedPromises: Promise<BigNumber>[] =
        loans.map(({
          parameters: {
            loanToken,
            amountWanted
          }
        }) => loanToken.humanize(amountWanted));
      const amountsWanted: BigNumber[] = await Promise.all(amountsWantedPromises);

      const amountsGatheredPromises: Promise<BigNumber>[] =
        loans.map(({
          parameters: {
            loanToken
          },
          blockchainState: {
            amountGathered
          }
        }) => loanToken.humanize(amountGathered));
      const amountsGathered: BigNumber[] = await Promise.all(amountsGatheredPromises);

      const loanTokenSymbolPromises: Promise<string>[] =
        loans.map(({
          parameters: {
            loanToken
          }
        }) => loanToken.symbol());
      const loanTokenSymbols: string[] = await Promise.all(loanTokenSymbolPromises);

      for (var i = 0; i < _loans.length; ++i) {
        _loans[i].amountWanted = amountsWanted[i].toString();
        _loans[i].amountGathered = amountsGathered[i].toString();
        _loans[i].tokenSymbol = loanTokenSymbols[i];
        _loans[i].isCollateralCollection = (_loans[i].loanState === LoanState.CollateralCollection);
        _loans[i].isFundraising = (_loans[i].loanState === LoanState.Fundraising);
      }

      this.isLoading = false;
      this.loans = _loans;
    })();
  },
  data() {
    return {
      loans: [],
      isLoading: false,
    }
  }
});
export default Component;
</script>

<style lang="scss" scoped>
.my-loans-spinner { margin-top: 100px; }
.my-loans { width: calc(100% - 200px); min-width: 570px; margin: 50px auto 40px;
  .ml-summary { display: flex; justify-content: center; }
  .ml-loans-container { display: flex; justify-content: center; flex-wrap: wrap; }
}
</style>
