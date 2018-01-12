<template>
  <div class="loan-invest">
    <div class="li-row-a">
      <div class="li-details-funded">
        <div class="li-details">
          <user-score :value="loan.userScore" />
          <div class="li-details-right">
            <div class="li-short-desc">{{ loan.description }}</div>
            <div class="li-user">Who: {{ loan.userName }}</div>
          </div>
        </div>
        <div class="li-bar-container">
          <fundraising-bar :percentage="loan.percentageFunded" barHeight="12px"/>
          <div class="li-bar-labels">
            <div> {{ formatPercentage(loan.percentageFunded) }}% FUNDED </div>
            <div> {{ formatPercentage(100 - loan.percentageFunded) }}% LEFT </div>
          </div>
        </div>
      </div>
      <div class="li-amounts-rate-time">
        <div class="li-amounts">
          <div class="li-wanted">
            <div class="li-title"> AMOUNT </div>
            <div class="li-value">{{ loan.amountWanted.toString() }} <small>{{loan.loanTokenSymbol}}</small> </div>
          </div>
          <div class="li-collateral">
            <div class="li-title"> COLLATERAL </div>
            <div class="li-value">{{ loan.collateralReceived.toString() }} <small>{{loan.collateralTokenSymbol}}</small> </div>
          </div>
        </div>
        <div class="li-rate-time">
          <div class="li-rate">
            <div class="li-title"> RATE </div>
            <div class="li-value">{{ loan.interestPermil / 10 }}%</div>
          </div>
          <div class="li-time">
            <div class="li-title"> FUNDRAISING DEADLINE </div>
            <div class="li-value">{{ loan.fundraisingDeadline.format('ll') }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="li-row-b">
      <div class="li-lent" v-if="!invested">
        <md-input-container :class="validators.nonNegativeNumber(this.amount).getClass()">
          <label>INVEST AMOUNT:</label>
          <md-input v-model="amount" type="number"></md-input>
          <div class="li-input-text">{{ loan.currency }}</div>
          <span class="md-error">{{ validators.nonNegativeNumber(this.amount).getErrorMsg() }}</span>
        </md-input-container>
        <div class="li-amount-left"> {{ account.balance.balance.toNumber() }} {{ account.balance.tokenSymbol }} available </div>
      </div>
      <div class="li-action">
        <div class="li-invested" v-if="invested">
          You have successfully invested in this loan! It will now appear in <a href="#/invest/my-investments">My Investments </a> tab
        </div>
        <div v-else>
          <div v-if="isInvesting">
            <spinner />
            <div class="rl-metamask-text">
              Please don't close this window and wait until we process your order. It usually takes about 10 seconds.
            </div>
          </div>
          <purple-button v-else
            :text="'INVEST'"
            :disabled='!validators.nonNegativeNumber(this.amount).isValid() || parseInt(this.amount) > account.balance.balance.toNumber()'
            @click.native='invest'
            />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex'

import UserScore from '../common/UserScore.vue';
import PurpleButton from '../common/PurpleButton.vue';
import FundraisingBar from '../common/FundraisingBar.vue';
import { StateT } from 'store';
import validators from 'utils/inputValidators';

import { GET_LOAN_TO_INVEST_ACTION } from 'store/invest/actions';
import { investInLoan } from 'api/invest';
import { formatPercentage } from 'utils/calc';

export default {
  name: 'LoanInvest',
  components: {
    'user-score': UserScore,
    'purple-button': PurpleButton,
    'fundraising-bar': FundraisingBar,
  },
  created() {
    const { shortId } = this.$route.params;
  },
  computed: mapState({
    account: (state:StateT) => state.account,
    loan: (state:StateT) => state.invest.activeLoan
  }),
  methods: {
    formatPercentage,
    invest: async function invest() {
      const { shortId } = this.$route.params;
      this.isInvesting = true;
      await investInLoan(shortId, this.amount);
      this.$store.dispatch(GET_LOAN_TO_INVEST_ACTION, {shortId});
      this.invested = true;
    }
  },
  data() {
    return {
      validators,
      amount: 0.01,
      invested: false,
      isInvesting: false
    }
  }
};
</script>

<style scoped lang="scss">
.loan-invest { width: 70%; min-width: 800px; margin: 0 auto;
  .li-row-a { display: flex; margin: 54px 0 0 0;
    .li-details-funded { width: 55%;  background-color: #ffffff; margin-right: 3%;
      .li-details { display: flex; align-items: center; padding: 30px; border-bottom: 1px solid var(--color-white-smoke);
        .li-details-right { margin-left: 20px;
          .li-short-desc { font-size: 26px; font-weight: 300;  letter-spacing: -0.3px; color: var(--color-black-cod); }
          .li-user { margin-top: 8px; font-size: 12px; font-weight: 300; color: #858585; }
        }
      }
      .li-bar-container { padding: 30px;
        .li-bar-labels { display: flex; justify-content: space-between; margin: 5px 0 0 0; font-size: 11px; font-weight: 300; letter-spacing: 0.4px; text-align: left; color: #858585; }
      }
    }
    .li-amounts-rate-time { width: 42%; background-color: #ffffff;
      .li-title { font-size: 11px; font-weight: 300; letter-spacing: 0.4px; color: #858585; }
      .li-value { font-size: 34px; font-weight: 300; line-height: 1.06; letter-spacing: -0.4px; color: var(--color-black-cod); }
      .li-amounts { display: flex;
        .li-wanted { width: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; border-right: 1px solid var(--color-white-smoke); border-bottom: 1px solid var(--color-white-smoke); }
        .li-collateral { width: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; border-bottom: 1px solid var(--color-white-smoke); }
      }
      .li-rate-time { display: flex;
        .li-rate { width: 35%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; border-right: 1px solid var(--color-white-smoke);  }
        .li-time { width: 65%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 30px;  }
      }
    }
  }
  .li-row-b { margin: 32px 0 50px 0;  background-color: #ffffff;
    .li-lent { padding: 30px; border-bottom: 1px solid var(--color-white-smoke);
      input { font-size: 30px; }
      .li-input-text { font-size: 13px; font-weight: 600; color: var(--color-black-cod); }
      .li-amount-left { margin-top: -10px; font-size: 12px; font-weight: 300; line-height: 1.83; color: #858585; }
    }
    .li-action { display: flex; justify-content: center; margin: 20px; padding-bottom: 20px;
      .li-invested { margin: 40px 0px 20px; }
    }
  }
}
</style>
