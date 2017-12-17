<template>
  <div>
    <div class="loan-invest-spinner" v-if="isLoading">
      <spinner />
    </div>
    <div class="loan-invest" v-else>
      <div class="li-row-a">
        <div class="li-details-funded">
          <div class="li-details">
            <user-score :value="loan.userScore" />
            <div class="li-details-right">
              <div class="li-short-desc">Loan {{ loan.shortDesc }}</div>
              <div class="li-user">Who: {{ loan.userName }}</div>
            </div>
          </div>
          <div class="li-bar-container">
            <fundraising-bar :percentage="loan.percentFunded" barHeight="12px"/>
            <div class="li-bar-labels">
              <div> {{ loan.percentFunded }}% FUNDED </div>
              <div> {{ loan.gatheringTimeLeft }} LEFT </div>
            </div>
          </div>
        </div>
        <div class="li-amount-rate-time">
          <div class="li-amount">
            <div class="li-title"> AMOUNT </div>
            <div class="li-value">{{ loan.amountWanted }} {{loan.tokenSymbol}} </div>
          </div>
          <div class="li-rate-time">
            <div class="li-rate">
              <div class="li-title"> RATE </div>
              <div class="li-value">{{ loan.interestPermil / 10 }}%</div>
            </div>
            <div class="li-time">
              <div class="li-title"> FUNDRAISING DEADLINE </div>
              <div class="li-value">{{ loan.fundraisingDeadline }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="li-row-b">
        <div class="li-lent">
          <md-input-container class="validators.nonNegativeInteger(this.amount).getClass()">
            <label>INVEST AMOUNT:</label>
            <md-input v-model="amount" type="number"></md-input>
            <div class="li-input-text">{{ loan.currency }}</div>
            <span class="md-error">{{ validators.nonNegativeNumber(this.amount).getErrorMsg() }}</span>
          </md-input-container>
          <div class="li-amount-left"> {{ account.balance }} {{ account.balanceTokenName }} available </div>
        </div>
        <div class="li-action">
          <purple-button
            :text="'INVEST'"
            :disabled='!validators.nonNegativeNumber(this.amount).isValid() || parseInt(this.amount) > parseInt(account.balance)'
            />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex'

import Spinner from '../common/Spinner.vue';
import UserScore from '../common/UserScore.vue';
import PurpleButton from '../common/PurpleButton.vue';
import FundraisingBar from '../common/FundraisingBar.vue';
import { StateT } from '@/store';
import { getLoanToInvest } from '@/api/invest';
import validators from '@/utils/inputValidators';

export default {
  name: 'LoanInvest',
  components: {
    'user-score': UserScore,
    'purple-button': PurpleButton,
    'fundraising-bar': FundraisingBar,
    'spinner': Spinner,
  },
  created() {
    const { shortId } = this.$route.params;
    this.getLoan(shortId);
  },
  methods: {
    getLoan: async function getLoan(shortId) {
      this.isLoading = true;
      let loan = await getLoanToInvest(shortId);
      this.loan = {
        ...loan,
        percentFunded: loan.amountGathered.mul(100).div(loan.amountWanted).toString(),
        amountGathered: loan.amountGathered.toString(),
        amountWanted: loan.amountWanted.toString(),
      }
      this.isLoading = false;
    }
  },
  computed: mapState({
    account: (state:StateT) => state.account
  }),
  data() {
    return {
      validators,
      loan: {},
      amount: 1,
      isLoading: true,
    }
  }
};
</script>

<style scoped lang="scss">
.loan-invest-spinner { margin-top: 200px; }
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
    .li-amount-rate-time { width: 42%; background-color: #ffffff;
      .li-title { font-size: 11px; font-weight: 300; letter-spacing: 0.4px; color: #858585; }
      .li-value { font-size: 34px; font-weight: 300; line-height: 1.06; letter-spacing: -0.4px; color: var(--color-black-cod); }
      .li-amount { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 30px; border-bottom: 1px solid var(--color-white-smoke); }
      .li-rate-time { display: flex;
        .li-rate { width: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 30px; border-right: 1px solid var(--color-white-smoke);  }
        .li-time { width: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 30px;  }
      }
    }
  }
  .li-row-b { margin: 32px 0 50px 0;  background-color: #ffffff;
    .li-lent { padding: 30px; border-bottom: 1px solid var(--color-white-smoke);
      input { font-size: 30px; }
      .li-input-text { font-size: 13px; font-weight: 600; color: var(--color-black-cod); }
      .li-amount-left { margin-top: -10px; font-size: 12px; font-weight: 300; line-height: 1.83; color: #858585; }
    }
    .li-action { display: flex; justify-content: center; margin: 20px; }
  }
}
</style>