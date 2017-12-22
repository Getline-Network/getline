<template>
  <div class="mit-finished">
    <div class="mit-finished-text"> You have successfully paid back: </div>
    <div class="mit-finished-percentage">{{formatBigNumber(loan.paybackAmount)}} {{loan.tokenSymbol}}</div>
  </div>
</template>

<script lang="ts">
import { formatBigNumber } from 'utils/calc';

export default {
  name: 'FundraisingSection',
  props: ['loan'],
  methods: {
    formatBigNumber
  }
};
</script>

<style scoped lang="scss">
  .mit-finished { display: flex; align-items: center; justify-content: space-between; min-height: 250px;padding: 23px 30px;
    .mit-finished-text { font-size: 12px; font-weight: 300; line-height: 1.83; color: #858585; }
    .mit-finished-percentage { font-size: 13px; font-weight: 600; color: var(--color-black-cod); }
  }
</style>
