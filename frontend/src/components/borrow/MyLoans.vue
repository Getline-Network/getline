<template>
  <div class="my-loans-spinner" v-if="isLoading">
    <spinner />
  </div>
  <div v-else class="my-loans">
   <div class="ml-summary">
     <tiles-summary
        label="CURRENTLY BORROWED"
        amount="145.00"
        currency="ETH" />
      <tiles-summary
        label="MINIMUM MONTHLY RATES"
        amount="20.00"
        currency="ETH" />
    </div>
    <div class="ml-loans-container">
      <loan-tile v-for="loan in loans" :key="loan.shortId" :loan="loan" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Summary from '../common/TilesSummary.vue';
import Spinner from '../common/Spinner.vue';
import MyLoanTile from './MyLoanTile.vue';
import API from '../../api';

const Component = Vue.extend({
  name: 'MyLoans',
  components: {
    'tiles-summary': Summary,
    'loan-tile': MyLoanTile,
    'spinner': Spinner,
  },
  created() {
    setTimeout(async () => {
      this.isLoading = true;
      let currentUser = await API.instance().currentUser();
      let loans = await API.instance().loansByOwner(currentUser);
      await Promise.all(loans.map(loan => loan.updateStateFromBlockchain()));
      let _loans = loans.map(({ description, parameters: {interestPermil} }) =>
        ({ description, interestPermil }));

      const humanizeAmounts = (await Promise.all(
        loans.map(({parameters: {loanToken, amountWanted}}) =>
          loanToken.humanize(amountWanted))
      )).map(amount => amount.toString())
      for (var i = 0; i < _loans.length; ++i) {
        _loans[i].amountWanted = humanizeAmounts[i];
      }

      this.isLoading = false;
      this.loans = _loans;
    });
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
.my-loans { width: calc(100% - 200px); min-width: 570px; margin: 15px auto 40px;
  .ml-summary { display: flex; justify-content: center; }
  .ml-loans-container { display: flex; justify-content: center; flex-wrap: wrap; }
}
</style>
