<template>
  <div class="my-investement-tile">
    <div class="mit-details">
      <user-score :value="investment.userScore" />
      <div class="mit-details-right">
        <div class="mit-short-desc">{{ investment.shortDesc }}</div>
        <div class="mit-user">{{ investment.userName }}</div>
      </div>
    </div>
    <div class="mit-financial-data">
      <div>
        <div class="mit-fin-line-a"> CURRENT RATE </div>
        <div class="mit-fin-line-b">{{ investment.currentRate }}</div>
      </div>
      <div>
        <div class="mit-fin-line-a"> RATE </div>
        <div class="mit-fin-line-b">{{ investment.rate }}</div>
        <div class="mit-fin-line-c">{{ investment.apr }} APR</div>
      </div>
      <div>
        <div class="mit-fin-line-a"> EARNED </div>
        <div class="mit-fin-line-b">{{ investment.earned }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import UserScore from '../../common/UserScore';

export default {
  name: 'MyInvestments',
  props: ['investment'],
  components: {
    'user-score': UserScore,
  },
};
</script>

<style scoped lang="scss">
.my-investement-tile { width: 400px; margin: 20px; border-radius: 2px; background-color: #ffffff;  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.02);
  .mit-details { display: flex; align-items: center; padding: 30px; border-bottom: 1px solid var(--color-white-smoke);
    .mit-details-right { margin-left: 20px;
      .mit-short-desc { font-size: 18px; font-weight: 600; line-height: 1.22; letter-spacing: -0.2px; color: var(--color-black-cod); }
      .mit-user { margin-top: 2px; font-size: 12px; font-weight: 300; color: #858585; }
    }
  }
  .mit-financial-data { display: flex; justify-content: space-between; padding: 23px 30px;
    .mit-fin-line-a { font-size: 11px; font-weight: 300; letter-spacing: 0.4px; color: #858585; }
    .mit-fin-line-b { font-size: 13px; font-weight: 600; color: var(--color-black-cod); }
    .mit-fin-line-c { font-size: 10px; font-weight: 300; line-height: 2.2; color: #858585; }
  }
}
</style>
