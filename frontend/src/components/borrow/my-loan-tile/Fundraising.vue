<template>
   <div class="mit-fundraising-container">
      <div class="mit-fundraising">
        <div class="mit-fundraising-line-a">
          <div class="mit-fundraising-text"> This loan is looking for investors </div>
          <div class="mit-fundraising-percentage">{{formatPercentage(countPercentageGathered(loan.amountGathered, loan.amountWanted))}}%</div>
        </div>
        <fundraising-bar :percentage="countPercentageGathered(loan.amountGathered, loan.amountWanted)" barHeight="8px"/>
        <div class="mit-fundraising-amount"> Remaining: {{ formatBigNumber(loan.amountWanted.sub(loan.amountGathered))}} {{ loan.tokenSymbol }} </div>
      </div>
    </div>
</template>

<script lang="ts">
import FundraisingBar from 'components/common/FundraisingBar.vue';
import { countPercentageGathered, formatPercentage, formatBigNumber } from 'utils/calc';

export default {
  name: 'FundraisingSection',
  props: ['loan'],
  components: {
    'fundraising-bar': FundraisingBar,
  },
  methods: {
    countPercentageGathered,
    formatPercentage,
    formatBigNumber
  }
};
</script>

<style scoped lang="scss">
  .mit-fundraising-container { display: flex; align-items: center; min-height: 250px;padding: 23px 30px;
    .mit-fundraising { display: flex; flex-direction: column; align-items: center; width: 100%;
      .mit-fundraising-line-a { display: flex; justify-content: space-between; width: 100%;
        .mit-fundraising-text { font-size: 12px; font-weight: 300; line-height: 1.83; color: #858585; }
        .mit-fundraising-percentage { font-size: 13px; font-weight: 600; color: var(--color-black-cod); }
      }
      .mit-fundraising-amount { margin: 12px; font-size: 12px; font-weight: 300; color: #858585; }
    }
  }
</style>
