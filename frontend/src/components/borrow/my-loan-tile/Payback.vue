<template>
  <div class="mit-payback">
    <div class="mlt-financial-data">
      <div>
        <div class="mlt-fin-line-a"> AMOUNT PAID BACK </div>
        <div class="mlt-fin-line-b">0 {{ loan.tokenSymbol }}</div>
      </div>
      <div>
      </div>
    </div>

    <div :class="transferingPaybakcClass(loan.isTransferingPayback)" >
      <div class="mlt-payback-amount">
        <div class="mlt-payback-left"> NEED TO PAY BACK: </div>
        <div class="mlt-payback-right"> {{ formatBigNumber(loan.paybackAmount) }} {{ loan.tokenSymbol }} </div>
      </div>
      <green-button
        class="mlt-send-payback-button"
        @click.native='transferPayback'
        text="PAY BACK"
      />
      <div class="mlt-spinner-container">
        <spinner />
        <div class="mlt-sending-text">
          Please don't close this window and wait until we process your order. It usually takes about 10 seconds
        </div>
      </div>
    </div>
  
  </div>
</template>


<script lang="ts">
import GreenButton from 'components/common/GreenButton.vue';
import Spinner from 'components/common/Spinner.vue';

import { StateT } from 'store';
import { GET_MY_BALANCE_ACTION } from 'store/account/actions';

import { TRANSFER_PAYBACK_ACTION, GET_MY_LOANS_ACTION } from 'store/my-loans/actions';
import { formatBigNumber } from 'utils/calc';

export default {
  name: 'MyLoanTilePaybackSection',
  props: ['loan'],
  components: {
    'green-button': GreenButton,
    'spinner': Spinner,
  },
  data() {
    return {
      payBackAmount: this.getLoan().amountGathered,
    };
  },
  methods: {
    formatBigNumber,
    getLoan: function () {
      if (!this.loan) return {};
      return this.loan;
    },
    transferPayback: async function transferPayback() {
      const payload = {
        shortId: this.getLoan().shortId,
        onSuccess: (function onSucces() {
          this.$store.dispatch(GET_MY_BALANCE_ACTION);
          this.$store.dispatch(GET_MY_LOANS_ACTION);
        }).bind(this)
      }
      this.$store.dispatch(TRANSFER_PAYBACK_ACTION, payload);
    },
    transferingPaybakcClass: function transferingPaybakcClass(isSending): string {
      return isSending ? 'mlt-sending-payback' : '';
    },
  }
};
</script>


<style scoped lang="scss">
  .mlt-financial-data { display: flex; justify-content: space-between; padding: 23px 30px; border-bottom: 1px solid var(--color-white-smoke);
    .mlt-fin-line-a { font-size: 11px; font-weight: 300; letter-spacing: 0.4px; color: #858585; }
    .mlt-fin-line-b { font-size: 13px; font-weight: 600; color: var(--color-black-cod); }
    .mlt-fin-line-c { font-size: 10px; font-weight: 300; line-height: 2.2; color: #858585; }
    .mlt-fin-line-right { text-align: right; }
  }

  .mit-payback { 
    .mlt-send-payback-button { margin: 23px;}
    .mlt-spinner-container { display: none; }
    .mlt-payback-amount { display: flex; justify-content: space-between; padding: 23px 30px 0 30px; 
      .mlt-payback-left { font-size: 11px; font-weight: 300; letter-spacing: 0.4px; color: #858585; }
      .mlt-payback-right { font-size: 13px; font-weight: 600; color: var(--color-black-cod); }
    }
  }
  .mlt-sending-payback  { padding: 23px 30px;
    .mlt-send-payback-button { display: none; }
    .mlt-sending-text { display: flex; justify-content: center; font-size: 18px; font-weight: 300; line-height: 1.22; letter-spacing: -0.2px; color: var(--color-black-cod); text-align: center; }
    .mlt-spinner-container { display: block; }
    .mlt-payback-amount { display: none; }
  }
</style>
