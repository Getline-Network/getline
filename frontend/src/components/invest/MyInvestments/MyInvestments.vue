<template>
 <spinner v-if="isLoading" class="my-investments-spinner"/>
  <div v-else class="my-investments">
    <no-investments v-if="false" />
    <div v-else>
      <div v-if="pendingInvestments.length > 0">
        <div class="mi-title"> Pending investments in fundraising loans:  </div>
        <div class="mi-completed-container">
          <my-investment-tile v-for="investment in pendingInvestments" :key="investment.id" :investment="investment" />
        </div>
      </div>
      <div v-if="activeInvestments.length > 0">
        <div class="mi-title"> Active investements: </div>
        <div class="mi-not-completed-container">
          <my-investment-tile v-for="investment in activeInvestments" :key="investment.id" :investment="investment" />
        </div>
      </div>
      <div v-if="finishedInvestments.length > 0">
        <div class="mi-title"> Completed investements </div>
        <div class="mi-completed-container">
          <my-investment-tile v-for="investment in finishedInvestments" :key="investment.id" :investment="investment" />
        </div>
      </div>
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
    isLoading: (state:StateT) => state.invest.isLoading,
    pendingInvestments: (state:StateT) => state.invest.pendingInvestments,
    activeInvestments: (state:StateT) => state.invest.activeInvestments,
    finishedInvestments: (state:StateT) => state.invest.finishedInvestments
  }),
};
</script>

<style scoped lang="scss">
.my-investments-spinner { margin-top: 100px; }
.my-investments { width: calc(100% - 200px); min-width: 570px; margin: 15px auto 40px;
  .mi-summary { display: flex; justify-content: center; }
  .mi-not-completed-container { display: flex; justify-content: center; flex-wrap: wrap; }
  .mi-title { margin: 60px 100px; font-size: 28px; line-height: 1; letter-spacing: -0.3px; color: #101010; color: var(--color-black-cod); }
  .mi-completed-container { display: flex; justify-content: center; flex-wrap: wrap; }
}
</style>
