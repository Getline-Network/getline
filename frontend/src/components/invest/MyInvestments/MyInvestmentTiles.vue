<template>
  <div>
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
</template>

<script lang="ts">
import { mapState } from 'vuex'

import MyInvestmentTile from './MyInvestmentTile.vue';

import { StateT } from '@/store';

export default {
  name: 'MyInvestments',
  components: {
    'my-investment-tile': MyInvestmentTile,
  },
  computed: mapState({
    pendingInvestments: (state:StateT) => state.invest.pendingInvestments,
    activeInvestments: (state:StateT) => state.invest.activeInvestments,
    finishedInvestments: (state:StateT) => state.invest.finishedInvestments
  }),
};
</script>

<style scoped lang="scss">
.mi-not-completed-container { display: flex; justify-content: center; flex-wrap: wrap; }
.mi-title { margin: 60px 100px; font-size: 28px; line-height: 1; letter-spacing: -0.3px; color: #101010; color: var(--color-black-cod); }
.mi-completed-container { display: flex; justify-content: center; flex-wrap: wrap; }
</style>
