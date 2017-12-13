<template>
  <spinner class="balance-loader" v-if="account.isLoading"/>
  <div v-else class="balance">
    <div class="ba-text">
      <div class="ba-my-account"> My balance: </div>
      <div class="ba-text-settings"> {{ account.balance }} {{ account.balanceTokenName }} </div>
    </div>
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex';

import Spinner from '@/components/common/Spinner.vue';
import { StateT } from '@/store';
import { GET_MY_BALANCE_ACTION } from '@/store/account/actions';

export default {
  name: 'Balance',
  computed: mapState({
    account: (state:StateT) => state.account
  }),
  created() {
    this.$store.dispatch(GET_MY_BALANCE_ACTION);
  },
  components: {
    'spinner': Spinner,
  },
};
</script>

<style scoped lang="scss">
.balance { display: flex;
  .ba-text { display: flex; flex-direction: column; justify-content: center; margin: 0 15px;
    .ba-my-account { font-size: 13px; text-align: right; color: var(--color-black-cod); }
    .ba-text-settings { font-size: 11px; font-weight: 300; letter-spacing: 0.4px; color: #858585; }
  }
}
.balance-loader { margin: 0px !important; }
</style>
