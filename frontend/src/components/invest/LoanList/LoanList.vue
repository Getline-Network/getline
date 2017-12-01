<template>
  <div class="loan-list">
    <div class="ll-title"> Loan listing </div>
    <spinner v-if="isLoading"/>
    <div v-else>
      <no-loans v-if="!loansToInvest" />
      <div v-else class="ll-container">
        <md-table md-sort="percent-needed">
          <md-table-header>
            <md-table-row>
              <md-table-head md-sort-by="name" class="ll-th"> NAME </md-table-head>
              <md-table-head md-sort-by="score" class="ll-th"> SCORE </md-table-head>
              <md-table-head md-sort-by="amount-needed" class="ll-th"> AMOUNT NEEDED </md-table-head>
              <md-table-head md-sort-by="time" class="ll-th"> TIME </md-table-head>
              <md-table-head md-sort-by="percent-funded" class="ll-th"> % FUNDED </md-table-head>
              <md-table-head md-sort-by="percent-needed" class="ll-th"> % NEEDED </md-table-head>
            </md-table-row>
          </md-table-header>
          <md-table-body>
            <md-table-row @click.native='goToLoan(loan.id)' v-for="loan in loansToInvest" :key="loan.id">
              <md-table-cell class="ll-td">{{ loan.userName }}</md-table-cell>
              <md-table-cell class="ll-td ll-score"> <user-score :value="loan.userScore"/> </md-table-cell>
              <md-table-cell class="ll-td">{{ loan.amountNeeded }}</md-table-cell>
              <md-table-cell class="ll-td ll-time">{{ loan.time }}</md-table-cell>
              <md-table-cell class="ll-td">{{ loan.percentFunded }}</md-table-cell>
              <md-table-cell class="ll-td">{{ loan.percentNeeded }}</md-table-cell>
            </md-table-row>
          </md-table-body>
        </md-table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'

import UserScore from '../../common/UserScore.vue';
import { goToLoan } from '@/router/redirects';
import NoLoans from './NoLoans.vue';
import Spinner from '@/components/common/Spinner.vue';

import { StateT } from '@/store';
import { GET_LOANS_TO_INVEST_ACTION } from '@/store/invest/actions';

export default {
  name: 'LoanList',
  components: {
    'no-loans': NoLoans,
    'user-score': UserScore,
    'spinner': Spinner,
  },
  methods: {
    goToLoan,
  },
  created() {
    this.$store.dispatch(GET_LOANS_TO_INVEST_ACTION);
  },
   computed: mapState({
    loansToInvest: (state:StateT) => state.invest.loansToInvest,
    isLoading: (state:StateT) => state.invest.isLoading
  })
};
</script>
<style scoped lang="scss">
.loan-list { width: calc(100% - 200px); min-width: 570px; margin: 0 auto;
  .ll-title { margin: 54px 0px 30px 25px; font-size: 28px; line-height: 1; letter-spacing: -0.3px; color: var(--color-black-cod); }
  .ll-container { margin-bottom: 40px; border-radius: 2px; background-color: #ffffff; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.02);
    .ll-th { height: 44px; font-size: 11px; font-weight: 300; letter-spacing: 0.4px; color: #858585; border-bottom: 1px solid var(--color-white-smoke); }
    .ll-td { height: 66px; font-size: 12px; text-align: left; color: #1c1c1c; border-bottom: 1px solid var(--color-white-smoke); cursor: pointer;
      &.ll-score { width: 300px; }
      &.ll-time { font-weight: 300; line-height: 1.83; color: #858585; }
    }
  }
}
</style>
