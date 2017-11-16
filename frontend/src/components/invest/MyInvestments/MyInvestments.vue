<template>
  <div class="my-investments">
    <no-investments v-if="displayNoElements" />
    <div v-if="!displayNoElements" class="mi-summary">
      <tiles-summary
        label="CURRENTLY INVESTED"
        amount="145.00"
        currency="ETH" />
      <tiles-summary
        label="EARNINGS"
        amount="20.00"
        currency="ETH" />
    </div>
    <div class="mi-not-completed-container">
      <my-investment-tile v-for="investment in notCompletedInvestments" :key="investment.id" :investment="investment" />
    </div>
    <div v-if="displayCompleted" class="mi-completed-title"> Completed investements </div>
    <div class="mi-completed-container">
      <my-investment-tile v-for="investment in completedInvestments" :key="investment.id" :investment="investment" />
    </div>
  </div>
</template>

<script>
import investments from '@/server/getNotCompletedInvestments'; // TODO remove mocks
import NoInvestments from './NoInvestments';
import MyInvestmentTile from './MyInvestmentTile';
import Summary from '../../common/TilesSummary';

export default {
  name: 'MyInvestments',
  components: {
    'no-investments': NoInvestments,
    'my-investment-tile': MyInvestmentTile,
    'tiles-summary': Summary,
  },
  data() {
    return {
      completedInvestments: investments,
      notCompletedInvestments: investments,
      displayNoInvestments: !(this.completedInvestments && this.completedInvestments.length > 0
        && this.notCompletedInvestments && this.notCompletedInvestments.length > 0),
    };
  },
  computed: {
    displayCompleted: function displayCompleted() {
      return this.completedInvestments && this.completedInvestments.length > 0;
    },
    displayNotCompleted: function displayNotCompleted() {
      return this.notCompletedInvestments && this.notCompletedInvestments.length > 0;
    },
    displayNoElements: function displayNoElements() {
      return !this.displayCompleted && !this.displayNotCompleted;
    },
  },
};
</script>

<style scoped lang="scss">
.my-investments { width: calc(100% - 200px); min-width: 570px; margin: 15px auto 40px;
  .mi-summary { display: flex; justify-content: center; }
  .mi-not-completed-container { display: flex; justify-content: center; flex-wrap: wrap; }
  .mi-completed-title { margin: 30px 100px; font-size: 28px; line-height: 1; letter-spacing: -0.3px; color: #101010; color: var(--color-black-cod); }
  .mi-completed-container { display: flex; justify-content: center; flex-wrap: wrap; }
}
</style>
