<template>
  <error-view v-if="errorReceiving" />
  <div v-else>
    <div class="loan-invest-spinner" v-if="loan.isLoading">
      <spinner />
    </div>
    <investment v-else />
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex'

import Spinner from '../common/Spinner.vue';
import { StateT } from 'store';

import { GET_LOAN_TO_INVEST_ACTION } from 'store/invest/actions';
import ErrorView from 'components/error/UnknownError.vue';
import Investment from './Investment.vue';

export default {
  name: 'LoanInvest',
  components: {
    'spinner': Spinner,
    'error-view': ErrorView,
    'investment': Investment
  },
  created() {
    const { shortId } = this.$route.params;
    this.$store.dispatch(GET_LOAN_TO_INVEST_ACTION, {shortId});
  },
  computed: mapState({
    account: (state:StateT) => state.account,
    loan: (state:StateT) => state.invest.activeLoan,
    errorReceiving: (state:StateT) => state.invest.errorReceiving
  }),
};
</script>

<style scoped lang="scss">
.loan-invest-spinner { margin-top: 200px; }
</style>