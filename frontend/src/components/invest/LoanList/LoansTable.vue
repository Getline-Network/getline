<template>
  <div class="ll-container">
    <md-table @sort="onSort">
      <md-table-header>
        <md-table-row>
          <md-table-head class="ll-th" md-sort-by="NAME"> NAME </md-table-head>
          <md-table-head class="ll-th"> SCORE </md-table-head>
          <md-table-head class="ll-th" md-sort-by="AMOUNT_WANTED"> AMOUNT WANTED </md-table-head>
          <md-table-head class="ll-th" md-sort-by="TIME"> FUNDRAISING DEADLINE </md-table-head>
          <md-table-head class="ll-th" md-sort-by="FUNDED"> % FUNDED </md-table-head>
          <md-table-head class="ll-th" md-sort-by="NEEDED"> % NEEDED </md-table-head>
        </md-table-row>
      </md-table-header>
      <md-table-body>
        <md-table-row @click.native='goToLoan(loan.id)' v-for="loan in loansToInvest" :key="loan.id">
          <md-table-cell class="ll-td">{{ loan.userName }}</md-table-cell>
          <md-table-cell class="ll-td ll-score"> <user-score :value="loan.userScore"/> </md-table-cell>
          <md-table-cell class="ll-td">{{ loan.amountWantedWithToken }}</md-table-cell>
          <md-table-cell class="ll-td ll-time">{{ loan.fundraisingDeadline.format('LL') }}</md-table-cell>
          <md-table-cell class="ll-td">{{ parseInt(loan.percentageFunded) }}</md-table-cell>
          <md-table-cell class="ll-td">{{ 100 - parseInt(loan.percentageFunded) }}</md-table-cell>
        </md-table-row>
      </md-table-body>
    </md-table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'

import UserScore from 'components/common/UserScore.vue';

import { StateT } from 'store';
import { SORT_LOANS_TO_INVEST_ACTION } from 'store/invest/actions';
import { sortColumnT } from 'store/invest/types';

import { goToLoan } from 'router/redirects';

export default {
  name: 'LoansTable',
  components: {
    'user-score': UserScore,
  },
  methods: {
    onSort: function onSort(sortType: sortColumnT) {
      this.$store.dispatch(SORT_LOANS_TO_INVEST_ACTION, sortType);
    },
    goToLoan,
  },
  computed: mapState({
    loansToInvest: (state:StateT) => state.invest.loansToInvest,
  })
};
</script>
<style scoped lang="scss">
 .ll-container { margin-bottom: 40px; border-radius: 2px; background-color: #ffffff; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.02);
  .ll-th { height: 44px; font-size: 11px; font-weight: 300; letter-spacing: 0.4px; color: #858585; border-bottom: 1px solid var(--color-white-smoke); }
  .ll-td { height: 66px; font-size: 12px; text-align: left; color: #1c1c1c; border-bottom: 1px solid var(--color-white-smoke); cursor: pointer;
    &.ll-score { width: 300px; }
    &.ll-time { font-weight: 300; line-height: 1.83; color: #858585; }
  }
}
</style>
