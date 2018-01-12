<template>
  <div class="loan-list">
    <div class="ll-title"> Loan listing </div>
    <error-view v-if="errorReceiving" />
    <div v-else>
      <spinner v-if="isLoading"/>
      <div v-else>
        <no-loans v-if="!loansToInvest" />
        <loans-table v-else />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'

import NoLoans from './NoLoans.vue';
import Spinner from 'components/common/Spinner.vue';
import ErrorView from 'components/error/UnknownError.vue';
import LoansTable from './LoansTable.vue';

import { StateT } from 'store';
import { GET_LOANS_TO_INVEST_ACTION } from 'store/invest/actions';

export default {
  name: 'LoanList',
  components: {
    'no-loans': NoLoans,
    'loans-table': LoansTable,
    'spinner': Spinner,
    'error-view' : ErrorView
  },
  created() {
    this.$store.dispatch(GET_LOANS_TO_INVEST_ACTION);
  },
  computed: mapState({
    loansToInvest: (state:StateT) => state.invest.loansToInvest,
    isLoading: (state:StateT) => state.invest.isLoading,
    errorReceiving: (state:StateT) => state.invest.errorReceiving,
  })
};
</script>
<style scoped lang="scss">
.loan-list { width: calc(100% - 200px); min-width: 570px; margin: 0 auto;
  .ll-title { margin: 54px 0px 30px 25px; font-size: 28px; line-height: 1; letter-spacing: -0.3px; color: var(--color-black-cod); }
}
</style>
