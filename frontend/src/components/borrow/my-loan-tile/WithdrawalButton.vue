<template>
  <div class="withdraw-button">
    <div :class="withdrawingClass(isSending)" >
      <green-button
        class="wb-green-button"
        @click.native='transferWithdrawal'
        :text="'WITHDRAW ' + formatBigNumber(amount) + ' ' + loan.loanTokenSymbol"
      />
      <div class="wb-spinner-container">
        <spinner />
        <div class="wb-sending-text">
          Please don't close this window and wait until we process your order. It usually takes about 10 seconds.
        </div>
      </div>
      <div v-if="showErrorMsg" class="wb-error-occured">An error occured, please try again.</div>
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
import { withdrawAll } from 'api/withdrawal';

export default {
  name: 'MyLoanTilePaybackSection',
  props: ['loan', 'amount'],
  components: {
    'green-button': GreenButton,
    'spinner': Spinner,
  },
  data() {
    return {
      isSending: false,
      showErrorMsg: false
    };
  },
  methods: {
    formatBigNumber,
    getLoan: function () {
      if (!this.loan) return {};
      return this.loan;
    },
    transferWithdrawal: async function transferWithdrawal() {
      const { shortId } = this.getLoan();
      this.isSending = true;
       try {
        await withdrawAll(shortId);
        this.$store.dispatch(GET_MY_BALANCE_ACTION);
        this.$store.dispatch(GET_MY_LOANS_ACTION);
      } catch (e) {
        this.showErrorMsg = true;
        setTimeout(() => this.showErrorMsg = false, 2000);
        this.loading = false;
      }
    },
    withdrawingClass: function withdrawingClass(isSending): string {
      return isSending ? 'wb-sending-withdrawal' : '';
    },
  }
};
</script>

<style scoped lang="scss">
.withdraw-button {
  .wb-green-button { margin: 23px;}
  .wb-spinner-container { display: none; }
}
.wb-sending-withdrawal  { padding: 23px 30px;
  .wb-green-button { display: none; }
  .wb-sending-text { display: flex; justify-content: center; font-size: 18px; font-weight: 300; line-height: 1.22; letter-spacing: -0.2px; color: var(--color-black-cod); text-align: center; }
  .wb-spinner-container { display: block; }
}
.wb-error-occured { font-size: 12px; text-align: center; margin-top: -15px; color: #ff5722; transition: visibility 0s, opacity 0.5s linear; }
</style>
