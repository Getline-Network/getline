<template>
  <div class="my-loan-tile">
    <div class="mlt-details">
        <div class="mlt-short-desc">{{ loan.description || "No description provided" }}</div>
    </div>
    <div class="mlt-financial-data">
      <div>
        <div class="mlt-fin-line-a"> AMOUNT WANTED </div>
        <div class="mlt-fin-line-b">{{ loan.amountWanted.toString() }} {{ loan.tokenSymbol }}</div>
      </div>
      <div>
        <div class="mlt-fin-line-a"> RATE </div>
        <div class="mlt-fin-line-b">{{ permilsToPercentage(loan.interestPermil) }}%</div>
      </div>
      <div>
        <div class="mlt-fin-line-a"> AMOUNT GATHERED </div>
        <div class="mlt-fin-line-b"> {{ loan.amountGathered.toString() }} {{ loan.tokenSymbol }}</div>
      </div>
    </div>
    <div v-if="loan.isFundraising" class="mit-fundraising-container">
      <div class="mit-fundraising">
        <div class="mit-fundraising-line-a">
          <div class="mit-fundraising-text"> This loan is looking for investors </div>
          <div class="mit-fundraising-percentage">{{formatPercentage(countPercentageGathered(loan.amountGathered, loan.amountWanted))}}%</div>
        </div>
        <fundraising-bar :percentage="countPercentageGathered(loan.amountGathered, loan.amountWanted)" barHeight="8px"/>
        <div class="mit-fundraising-amount"> Remaining: {{ formatBigNumber(loan.amountWanted.sub(loan.amountGathered))}} {{ loan.tokenSymbol }} </div>
      </div>
    </div>
    <div v-if="loan.isCollateralCollection" :class="transferingCollateralClass(loan.isTransferingCollateral)" class="mit-collateral">
      <div class="mit-collateral-text"> Things to do before loan: </div>
      <md-input-container
        class="mlt-collateral-input"
        :class="validators.nonNegativeInteger(this.collateralAmount).getClass()"
      >
        <label> AMOUNT </label>
        <md-input v-model="collateralAmount" type="number" />
        <div class="rl-input-right-text"> {{ balanceTokenName }}</div>
        <span class="md-error">{{ validators.nonNegativeNumber(this.collateralAmount).getErrorMsg() }}</span>
      </md-input-container>
      <purple-button
        class="mlt-send-collateral-button"
        @click.native='transferCollateral'
        text="TRANSFER COLLATERAL DEMO TOKEN"
        :disabled='!validators.nonNegativeNumber(this.collateralAmount).isValid()'
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
import { mapState } from 'vuex';

import PurpleButton from 'components/common/PurpleButton.vue';
import FundraisingBar from 'components/common/FundraisingBar.vue';
import Spinner from 'components/common/Spinner.vue';

import { StateT } from 'store';
import { GET_MY_BALANCE_ACTION } from 'store/account/actions';
import { TRANSFER_COLLATERAL } from 'store/my-loans/actions';
import validators from 'utils/inputValidators';
import { countPercentageGathered, formatPercentage, permilsToPercentage, formatBigNumber } from 'utils/calc';

export default {
  name: 'MyLoanTile',
  props: ['loan'],
  components: {
    'purple-button': PurpleButton,
    'fundraising-bar': FundraisingBar,
    'spinner': Spinner,
  },
  data() {
    return {
      validators,
      collateralAmount: '30',
      sendingCollateral: false,
    };
  },
  computed: mapState({
    balanceTokenName: (state:StateT) => state.account.balanceTokenName
  }),
  methods: {
    formatBigNumber,
    permilsToPercentage,
    formatPercentage,
    countPercentageGathered,
    getLoan: function () {
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
.my-loan-tile { width: 400px; margin: 20px; border-radius: 2px; background-color: #ffffff;  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.02);
  .mlt-details { display: flex; align-items: center; padding: 30px; border-bottom: 1px solid var(--color-white-smoke);
    .mlt-short-desc { font-size: 18px; font-weight: 600; line-height: 1.22; letter-spacing: -0.2px; color: var(--color-black-cod); }
  }
  .mlt-financial-data { display: flex; justify-content: space-between; padding: 23px 30px; border-bottom: 1px solid var(--color-white-smoke);
    .mlt-fin-line-a { font-size: 11px; font-weight: 300; letter-spacing: 0.4px; color: #858585; }
    .mlt-fin-line-b { font-size: 13px; font-weight: 600; color: var(--color-black-cod); }
    .mlt-fin-line-c { font-size: 10px; font-weight: 300; line-height: 2.2; color: #858585; }
  }
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
  .mit-fundraising-container { display: flex; align-items: center; min-height: 250px;padding: 23px 30px;
    .mit-fundraising { display: flex; flex-direction: column; align-items: center; width: 100%;
      .mit-fundraising-line-a { display: flex; justify-content: space-between; width: 100%;
        .mit-fundraising-text { font-size: 12px; font-weight: 300; line-height: 1.83; color: #858585; }
        .mit-fundraising-percentage { font-size: 13px; font-weight: 600; color: var(--color-black-cod); }
      }
      .mit-fundraising-amount { margin: 12px; font-size: 12px; font-weight: 300; color: #858585; }
    }
  }
}
</style>
