<template>
  <div>
    <div class="loan-invest">
      <div class="li-row-a">
        <div class="li-details-funded">
          <div class="li-details">
            <user-score :value="loan.userScore"/>
            <div class="li-details-right">
              <div class="li-short-desc"> {{ loan.shortDesc }} </div>
              <div class="li-user"> {{ loan.userName }} </div>
            </div>
          </div>
          <div class="li-bar-container">
            <div class="li-bar">
              <div class="li-bar-funded" :style="{ width: loan.procentFunded + '%' }"></div>
              <div class="li-bar-remaining"></div>
            </div>
            <div class="li-bar-labels">
              <div> {{ loan.procentFunded }}% FUNDED </div>
              <div> {{ loan.gatheringTimeLeft }} LEFT </div>
            </div>
          </div>
        </div>
        <div class="li-amount-rate-time">
          <div class="li-amount">
            <div class="li-title"> AMOUNT </div>
            <div class="li-value"> {{ loan.amountNeeded }} </div>
          </div>
          <div class="li-rate-time">
            <div class="li-rate">
              <div class="li-title"> RATE </div>
              <div class="li-value"> {{ loan.rate }} </div>
            </div>
            <div class="li-time">
              <div class="li-title"> TIME </div>
              <div class="li-value"> {{ loan.paybackTime }} </div>
            </div>
          </div>
        </div>
      </div>
      <div class="li-row-b">
        <div class="li-lent">
          <md-input-container>
            <label>AMOUNT</label>
            <md-input v-model="amount" type="number"></md-input>
            <div class="li-input-text"> {{ loan.currency }} </div>
          </md-input-container>
          <div class="li-amount-left"> {{ loan.available }}  {{ loan.currency }} available </div>
        </div>
        <div class="li-action"> <purple-button :text="'INVEST'" /> </div>
      </div>
    </div>
  </div>
</template>

<script>
import loan from '../../../server/getLoan';
import UserScore from './UserScore';
import PurpleButton from '../common/PurpleButton';

export default {
  name: 'LoanInvest',
  data() {
    return {
      loan,
      amount: '',
    };
  },
  components: {
    'user-score': UserScore,
    'purple-button': PurpleButton,
  },
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
        .li-bar { display: flex; height: 12px; width: 100%;
          .li-bar-funded { background: #21ce4c; background: -webkit-linear-gradient(-90deg, #21ce4c, #7249f7); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(-90deg,  #21ce4c, #7249f7); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(-90deg,  #21ce4c, #7249f7); /* For Firefox 3.6 to 15 */  background: linear-gradient(-90deg,  #21ce4c, #7249f7); /* Standard syntax */ }
          .li-bar-remaining { background-color: var(--color-white-smoke); flex-grow: 1; }
        }
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
    .li-lent { padding: 30px;  border-bottom: 1px solid var(--color-white-smoke);
      input { font-size: 30px; }
      .li-input-text { font-size: 13px; font-weight: 600; color: var(--color-black-cod); }
      .li-amount-left { margin-top: -10px; font-size: 12px; font-weight: 300; line-height: 1.83; color: #858585; }
    }
    .li-action { display: flex; justify-content: center; margin: 20px; }
  }
}
</style>