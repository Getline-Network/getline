<template>
  <div class="my-investments">
    <div class="mi-summary">
      <div class="mi-invested">
        <div class="mi-label">CURRENTLY INVESTED </div>
        <div class="mi-amount-currency">
          <div class="mi-amount"> 145.00 </div>
          <div class="mi-currency"> ETH </div>
        </div>
      </div>
      <div class="mi-earnings">
        <div class="mi-label">EARNINGS </div>
        <div class="mi-amount-currency">
          <div class="mi-amount"> 20.00 </div>
          <div class="mi-currency"> ETH </div>
        </div>
      </div>
    </div>
    <div class="mi-not-completed-container">
      <my-investment-tile  v-for="investment in investments" :key="investment.id" :investment="investment" />
    </div>
      <div class="mi-completed-title">
      Completed investements
      </div>
      <div class="mi-completed-container">
        <my-investment-tile  v-for="investment in investments" :key="investment.id" :investment="investment" />
      </div>
  </div>
</template>

<script>
import NoInvestments from './NoInvestments';
import MyInvestmentTile from './MyInvestmentTile';
import UserScore from '../../common/UserScore';
import investments from '../../../../server/getNotCompletedInvestments';

export default {
  name: 'MyInvestments',
  components: {
    'no-investments': NoInvestments,
    'user-score': UserScore,
    'my-investment-tile': MyInvestmentTile,
  },
  data() {
    return {
      investments,
    };
  },
};
</script>
<style scoped lang="scss">
.my-investments { width: calc(100% - 200px); min-width: 570px; margin: 15px auto 40px;
  .mi-summary { display: flex; justify-content: center;
    .mi-invested, .mi-earnings { margin: 30px;
      .mi-label { font-size: 11px; font-weight: 300; letter-spacing: 0.4px; color: #858585; }
      .mi-amount-currency { display: flex; justify-content: space-between;
        .mi-amount { font-size: 34px; font-weight: 300; line-height: 1.06; letter-spacing: -0.4px; color: var(--color-black-cod); }
        .mi-currency { font-size: 18px; font-weight: 300; line-height: 1.22; letter-spacing: -0.2px; color: var(--color-black-cod); }
      }
    }
  }
  .mi-not-completed-container { display: flex; justify-content: center; flex-wrap: wrap;
  }
  .mi-completed-title { margin: 30px 100px; font-size: 28px; line-height: 1; letter-spacing: -0.3px; color: #101010; color: var(--color-black-cod); }
  .mi-completed-container { display: flex; justify-content: center; flex-wrap: wrap; }
}
</style>
