<template>
  <div class="tiles-summary">
    <div class="ts-label">{{ label }}</div>
    <div class="ts-amount-currency">
      <div class="ts-amount">{{ amount }}</div>
      <div class="ts-currency">{{ currency }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TileSummary',
    props: ['label', 'amount', 'currency'],
};
</script>

<style scoped lang="scss">
 .tiles-summary { margin: 30px;
  .ts-label { font-size: 11px; font-weight: 300; letter-spacing: 0.4px; color: #858585; }
  .ts-amount-currency { display: flex; justify-content: center;
    .ts-amount { font-size: 34px; font-weight: 300; line-height: 1.06; letter-spacing: -0.4px; color: var(--color-black-cod); }
    .ts-currency { font-size: 18px; font-weight: 300; line-height: 1.22; letter-spacing: -0.2px; color: var(--color-black-cod); }
  }
}
</style>
