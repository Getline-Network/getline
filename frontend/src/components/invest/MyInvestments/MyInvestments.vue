<template>
 <spinner v-if="isLoading" class="my-investments-spinner"/>
  <div v-else class="my-investments">
    <div class="mi-completed-title"> Active investments </div>
    <no-investments v-if="myActiveInvestements && myActiveInvestements.length == 0" />
    <div class="mi-not-completed-container">
      <my-investment-tile v-for="investment in myActiveInvestements" :key="investment.id" :investment="investment" />
    </div>
    <div class="mi-completed-title"> Completed investements </div>
    <no-investments v-if="myCompletedInvestments && myCompletedInvestments.length == 0" />
    <div class="mi-completed-container">
      <my-investment-tile v-for="investment in myCompletedInvestments" :key="investment.id" :investment="investment" />
    </div>
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex'

import NoInvestments from './NoInvestments.vue';
import MyInvestmentTile from './MyInvestmentTile.vue';
import Summary from '../../common/TilesSummary.vue';
import Spinner from '@/components/common/Spinner.vue';

import { StateT } from '@/store';
import { GET_MY_INVESTMENTS_ACTION } from '@/store/invest/actions';

export default {
  name: 'MyInvestments',
  components: {
    'no-investments': NoInvestments,
    'my-investment-tile': MyInvestmentTile,
    'tiles-summary': Summary,
    'spinner': Spinner,
  },
  created() {
    this.$store.dispatch(GET_MY_INVESTMENTS_ACTION);
  },
  computed: mapState({
    isLoading: (state:StateT) => {
      console.log(state.invest);
      return state.invest.isLoading;
    },
    myActiveInvestements: (state:StateT) => state.invest.myActiveInvestements,
    myCompletedInvestments: (state:StateT) => state.invest.myCompletedInvestments
  }),
};
</script>

<style scoped lang="scss">
.my-investments-spinner { margin-top: 100px; }
.my-investments { width: calc(100% - 200px); min-width: 570px; margin: 15px auto 40px;
  .mi-summary { display: flex; justify-content: center; }
  .mi-not-completed-container { display: flex; justify-content: center; flex-wrap: wrap; }
  .mi-completed-title { margin: 30px 100px; font-size: 28px; line-height: 1; letter-spacing: -0.3px; color: #101010; color: var(--color-black-cod); }
  .mi-completed-container { display: flex; justify-content: center; flex-wrap: wrap; }
}
</style>
