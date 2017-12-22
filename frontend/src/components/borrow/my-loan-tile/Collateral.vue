<template>
 <div :class="transferingCollateralClass(loan.isTransferingCollateral)" class="mit-collateral">
      <div class="mit-collateral-text"> Things to do before taking a loan: </div>
      <md-input-container
        class="mlt-collateral-input"
        :class="validators.nonNegativeInteger(this.collateralAmount).getClass()"
      >
        <label> AMOUNT </label>
        <md-input v-model="collateralAmount" type="number" />
        <div class="rl-input-right-text"> {{ loan.tokenSymbol }} </div>
        <span class="md-error">{{ validators.nonNegativeNumber(this.collateralAmount).getErrorMsg() }}</span>
      </md-input-container>
      <purple-button
        class="mlt-send-collateral-button"
        @click.native='transferCollateral'
        text="TRANSFER COLLATERAL"
        :disabled='!validators.nonNegativeNumber(this.collateralAmount).isValid()'
      />
      <div class="mlt-spinner-container">
        <spinner />
        <div class="mlt-sending-text">
          Please don't close this window and wait until we process your order. It usually takes about 10 seconds
        </div>
      </div>
    </div>
</template>


<script lang="ts">
import PurpleButton from 'components/common/PurpleButton.vue';
import Spinner from 'components/common/Spinner.vue';

import { GET_MY_BALANCE_ACTION } from 'store/account/actions';
import { TRANSFER_COLLATERAL } from 'store/my-loans/actions';
import validators from 'utils/inputValidators';

const DEFAULT_COLLATERAL = 30;

export default {
  name: 'PaybackSection',
  props: ['loan'],
  components: {
    'purple-button': PurpleButton,
    'spinner': Spinner,
  },
  data() {
    return {
      validators,
      collateralAmount: DEFAULT_COLLATERAL,
    };
  },
  methods: {
    getLoan: function () {
      if (!this.loan) return {};
      return this.loan;
    },
    transferCollateral: async function transferCollateral() {
      const payload = {
        shortId: this.getLoan().shortId,
        amount: this.collateralAmount,
        onSuccess: (function onSucces() {
          this.$store.dispatch(GET_MY_BALANCE_ACTION);
        }).bind(this)
      }
      this.$store.dispatch(TRANSFER_COLLATERAL, payload);
    },
    transferingCollateralClass: function transferingCollateralClass(isSending): string {
      return isSending ? 'mlt-sending-collateral' : '';
    },
  }
};
</script>


<style scoped lang="scss">
  .mit-collateral {
    .mit-collateral-text { padding: 23px 23px 0px 23px; font-size: 18px; font-weight: 300; line-height: 1.22; letter-spacing: -0.2px; color: var(--color-black-cod); }
    .mlt-collateral-input { width: calc(100% - 46px); margin: 23px; }
    .mlt-send-collateral-button { margin: 23px;}
    .mlt-spinner-container { display: none; }
  }
  .mit-collateral.mlt-sending-collateral  { padding: 23px 30px;
    .mlt-send-collateral-button, .mit-collateral-text, .mlt-collateral-input { display: none; }
    .mlt-sending-text { display: flex; justify-content: center; font-size: 18px; font-weight: 300; line-height: 1.22; letter-spacing: -0.2px; color: var(--color-black-cod); text-align: center; }
    .mlt-spinner-container { display: block; }
  }
</style>
