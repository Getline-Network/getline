<template>
  <div class="my-loan-tile">
    <div class="mlt-details">
        <div class="mlt-short-desc">{{ loan.description }}</div>
    </div>
    <div class="mlt-financial-data">
      <div>
        <div class="mlt-fin-line-a"> AMOUNT BORROWED </div>
        <div class="mlt-fin-line-b">{{ loan.amountWanted }}</div>
      </div>
      <div>
        <div class="mlt-fin-line-a"> RATE </div>
        <div class="mlt-fin-line-b">{{ loan.interestPermil }}%</div>
        <!-- div class="mlt-fin-line-c">{{ loan.apr }} APR</div -->
      </div>
      <div>
        <div class="mlt-fin-line-a"> EARNED </div>
        <div class="mlt-fin-line-b">?</div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'MyLoanTile',
  props: ['loan'],
  components: {
  },
};
</script>

<style scoped lang="scss">
.my-loan-tile { width: 400px; margin: 20px; border-radius: 2px; background-color: #ffffff;  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.02);
  .mlt-details { display: flex; align-items: center; padding: 30px; border-bottom: 1px solid var(--color-white-smoke);
    .mlt-short-desc { font-size: 18px; font-weight: 600; line-height: 1.22; letter-spacing: -0.2px; color: var(--color-black-cod); }
  }
  .mlt-financial-data { display: flex; justify-content: space-between; padding: 23px 30px;
    .mlt-fin-line-a { font-size: 11px; font-weight: 300; letter-spacing: 0.4px; color: #858585; }
    .mlt-fin-line-b { font-size: 13px; font-weight: 600; color: var(--color-black-cod); }
    .mlt-fin-line-c { font-size: 10px; font-weight: 300; line-height: 2.2; color: #858585; }
  }
}
</style>
