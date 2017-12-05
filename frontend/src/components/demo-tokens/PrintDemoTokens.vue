<template>
  <div class="print-tokens">
    <div class="pt-form" :class="isLoading()">
      <div class="pt-title">This is demo of Getline loan system</div>
      <div class="pt-subtitle">To start get your free test tokens</div>
      <div class="pt-image-container">
        <img class="pt-token-image" :src="require('../../assets/blue-triangle.png')" />
        <div class="pt-token-amount"> 1000 </div>
      </div>
      <purple-button class="pt-button" text="GET TEST TOKENS" @click.native='requestTokens'  />
      <div class="pt-loader">
        <spinner />
        <div class="rl-loader-text">
          Please don't close this window and wait until we process your order. It usually takes about 10 seconds
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import Spinner from '@/components/common/Spinner.vue';
import PurpleButton from '@/components/common/PurpleButton.vue';
import API, { Loan, printMeDemoTokens } from '@/api';
import { goToLoan } from '@/router';

const Component = Vue.extend({
  name: 'PrintDemoTokens',
  components: {
    'purple-button': PurpleButton,
    'spinner': Spinner,
  },
  data() {
    return {
      loading: false,
    };
  },
  methods: {
    isLoading: function isLoading():string {
      return this.loading ? 'pt-loading' : '';
    },
    requestTokens: async function requestTokens() {
      this.loading = true;
      await printMeDemoTokens();
      // TODO 58
      this.loading = false;
    },
  },
});
export default Component;
</script>

<style lang="scss" scoped>
.print-tokens{ width: 40%; min-width: 570px; margin: 150px auto;
  .pt-form { display: flex; justify-content: center; flex-direction: column; min-height: 400px; margin-bottom: 40px;border-radius: 2px; background-color: #ffffff; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.02);
    .pt-title { display:flex; justify-content: center; font-size: 26px; font-weight: 300; line-height: 1.38; letter-spacing: -0.3px; color: var(--color-black-cod); }
    .pt-subtitle { display:flex; justify-content: center; font-size: 12px; font-weight: 300; line-height: 1.83; color: #858585; }
    .pt-button { display: flex; justify-content: center; margin: 0 auto; max-width: 200px; }
    .pt-image-container { display: flex; justify-content: center; align-items: center; margin: 50px 0;
      .pt-token-image { width: 20px; height: 20px; }
      .pt-token-amount { margin: 0 10px; font-size: 24px; font-weight: 300; color: var(--color-black-cod); }
    }
    .pt-loader { display: none; }
    .rl-loader-text { display: flex; justify-content: center; padding: 0 20px; font-size: 18px; font-weight: 300; line-height: 1.22; letter-spacing: -0.2px; color: var(--color-black-cod); text-align: center; }
  }
  .pt-form.pt-loading {
    .pt-button { display: none; }
    .pt-loader { display: block; }
  }
}
</style>
