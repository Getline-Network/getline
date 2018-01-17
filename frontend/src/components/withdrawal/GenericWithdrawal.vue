<template>
  <div class="generic-withdrawal">
    <div>
      <div class="gw-payback">
        <div class="gw-payback-left">{{ text }} </div>
        <div class="gw-payback-right"> {{ formatBigNumber(withdrawal.amount) + ' ' + withdrawal.tokenSymbol }} </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { formatBigNumber } from 'utils/calc';

export default {
  name: 'GenericWithdrawal',
  props: ['withdrawal', 'text'],
  methods: {
    formatBigNumber
  }
};
</script>

<style scoped lang="scss">
.generic-withdrawal {
  .gw-payback { display: flex; justify-content: space-between; padding: 23px 30px;
    .gw-payback-left { max-width: 60%; font-size: 11px; font-weight: 300; letter-spacing: 0.4px; color: #858585; }
    .gw-payback-right { display: flex; align-items: center; font-size: 13px; font-weight: 600; color: var(--color-black-cod); }
  }
}
</style>
