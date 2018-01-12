<template>
  <error-view v-if="errorReceiving" />
  <div v-else>
    <spinner v-if="isLoading" class="my-investments-spinner"/>
    <div v-else class="my-investments">
      <no-investments v-if="false" />
      <my-investment-tiles v-else />
    </div>
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex'

import NoInvestments from './NoInvestments.vue';
import MyInvestmentTiles from './MyInvestmentTiles.vue';
import Spinner from 'components/common/Spinner.vue';
import ErrorView from 'components/error/UnknownError.vue';

import { StateT } from 'store';
import { GET_MY_INVESTMENTS_ACTION } from 'store/invest/actions';

export default {
  name: 'MyInvestments',
  components: {
    'no-investments': NoInvestments,
    'spinner': Spinner,
    'my-investment-tiles': MyInvestmentTiles,
    'error-view': ErrorView
  },
  created() {
    this.$store.dispatch(GET_MY_INVESTMENTS_ACTION);
  },
  computed: mapState({
    isLoading: (state:StateT) => state.invest.isLoading,
    errorReceiving: (state:StateT) => state.invest.errorReceiving,
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
