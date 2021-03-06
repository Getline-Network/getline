<template>
  <div class="request-loan-container">
    <div class="rl-title"> Request loan </div>
    <div class="rl-form">
      <div class="rl-amount-and-percentage"> Amount and percentage </div>
      <div class="rl-amount-container">
        <div class="rl-amount">
          <md-input-container :class="validators.nonNegativeNumber(this.amount).getClass()">
            <label> AMOUNT </label>
            <md-input v-model="amount" type="number" />
            <div class="rl-input-right-text"> {{ account.balance.tokenSymbol }} </div>
            <span class="md-error">{{ validators.nonNegativeNumber(this.amount).getErrorMsg() }}</span>
          </md-input-container>
        </div>
        <div class="rl-token">
          <md-input-container :class="validators.nonNegativeNumber(this.interestPermil).getClass()">
            <label> INTEREST PERMILS </label>
            <md-input type="number" v-model="interestPermil" />
            <div class="rl-input-right-text">	&#8240;</div>
            <span class="md-error"> {{ validators.nonNegativeNumber(this.interestPermil).getErrorMsg() }}</span>
          </md-input-container>
        </div>
      </div>
      <div class="rl-payback-container">
        <div class="rl-payback">
          <md-input-container :class="validators.nonNegativeInteger(this.paybackTime).getClass()">
            <label> PAYBACK TIME </label>
            <md-input v-model="paybackTime" type="number" />
            <div class="rl-input-right-text"> DAY(S) </div>
            <span class="md-error">{{ validators.nonNegativeInteger(this.paybackTime).getErrorMsg() }}</span>
          </md-input-container>
        </div>
      </div>
      <div class="rl-fundraising">
        <div> Fundraising time period </div>
        <div class="rl-fundraising-time"> 7 DAYS </div>
      </div>
      <div class="rl-description">
        <md-input-container>
          <label> Description </label>
          <md-textarea v-model="description" maxlength="800" />
        </md-input-container>
      </div>
      <div class="rl-metamask" :class="isLoading()">
        <purple-button class="rl-request-button" text="REQUEST LOAN" :disabled='!isValidForm' @click.native='requestLoanAction' />
        <div v-if="showErrorMsg" class="rl-error-occured">An error occured, please try again.</div>
        <div class="rl-loader">
          <spinner />
          <div class="rl-metamask-text">
            Please don't close this window and wait until we process your order. It usually takes about 10 seconds.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex'

import PurpleButton from 'components/common/PurpleButton.vue';
import Spinner from 'components/common/Spinner.vue';

import API, { Loan } from 'api';
import { goToMyLoans } from 'router';
import validators from 'utils/inputValidators';
import { requestLoan } from 'api/request-loan';
import { StateT } from 'store';

const Component = Vue.extend({
  name: 'RequestLoan',
  data() {
    return {
      validators,
      amount: '10',
      interestPermil: '5',
      description: '',
      paybackTime: '7',
      loading: false,
      showErrorMsg: false
    };
  },
  components: {
    'purple-button': PurpleButton,
    'spinner': Spinner,
  },
  computed: {
    ...mapState({
      account: (state:StateT) => state.account,
    }),
    isValidForm: function():boolean {
      return (
        validators.nonNegativeNumber(this.amount).isValid() &&
        validators.nonNegativeNumber(this.interestPermil).isValid() &&
        validators.nonNegativeInteger(this.paybackTime).isValid()
      );
    },
  },
  methods: {
    isLoading: function isLoading():string {
      return this.loading ? 'rl-loading' : '';
    },
    requestLoanAction: async function requestLoanAction() {
      if (!this.isValidForm) return;
      this.loading = true;
      try {
        await requestLoan(this.amount, this.interestPermil, this.paybackTime, this.description);
        goToMyLoans();
      } catch (e) {
        this.showErrorMsg = true;
        setTimeout(() => this.showErrorMsg = false, 1000);
        this.loading = false;
      }
    }
  }
});
export default Component;
</script>

<style lang="scss" scoped>
.request-loan-container { width: 40%; min-width: 570px; margin: 0 auto;
  .rl-title { margin: 54px 0px 30px 25px; font-size: 28px; line-height: 1; letter-spacing: -0.3px; color: var(--color-black-cod); }
  .rl-form { display: flex; justify-content: center; flex-direction: column; margin-bottom: 40px; border-radius: 2px; background-color: #ffffff; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.02);
    .rl-input-right-text { margin-top: 7px; font-size: 16px; font-weight: 300; letter-spacing: -0.1px; color: #858585; }
    .rl-amount-and-percentage { padding: 30px; font-size: 18px; font-weight: 600; line-height: 1.22; letter-spacing: -0.2px; color: var(--color-black-cod); }
    .rl-amount-container { display: flex; padding: 0px 30px 20px; border-bottom: 1px solid var(--color-white-smoke);
      .rl-amount { width: 50%; }
      .rl-token { width: 50%; margin-left: 15px}
    }
    .rl-payback-container { padding: 20px 30px; border-bottom: 1px solid var(--color-white-smoke);
      .rl-payback { width: 100% }
    }
    .rl-fundraising { padding: 20px 30px; font-size: 18px; font-weight: 600; line-height: 1.22; letter-spacing: -0.2px; color: var(--color-black-cod); border-bottom: 1px solid var(--color-white-smoke);
      .rl-fundraising-time { display: flex; justify-content: center; margin: 10px 0px; padding: 11px; border-radius: 2px; background-color: rgba(0, 0, 0, 0); border: solid 2px #eeeeee; font-size: 12px; font-weight: 300; line-height: 1.83 ;color: #858585; }
    }
    .rl-description { padding: 20px 30px; border-bottom: 1px solid var(--color-white-smoke); }
    .rl-metamask { margin: 30px 100px 60px;
      .rl-metamask-text { display: flex; justify-content: center; font-size: 18px; font-weight: 300; line-height: 1.22; letter-spacing: -0.2px; color: var(--color-black-cod); text-align: center; }
      .rl-loader { display: none; }
      .rl-request-button { max-width: 200px; margin: 20px auto; }
      .rl-error-occured { font-size: 12px; text-align: center; margin-top: -15px; color: #ff5722; transition: visibility 0s, opacity 0.5s linear; }
    }
    .rl-metamask.rl-loading {
      .rl-request-button { display: none; }
      .rl-loader { display: block; }
    }
  }
}
</style>
