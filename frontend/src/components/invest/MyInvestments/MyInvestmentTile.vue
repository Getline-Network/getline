<template>
  <div class="my-investement-tile">
    <div class="mit-details">
      <user-score :value="investment.userScore" />
      <div class="mit-details-right">
        <div class="mit-short-desc">{{ investment.description || "No description" }}</div>
        <div class="mit-user">{{ investment.userName }}</div>
      </div>
    </div>
    <div class="mit-financial-data">
      <div>
        <div class="mit-fin-line-a"> <div> CURRENT </div> <div> RATE </div> </div>
        <div class="mit-fin-line-b">{{ permilsToPercentage(investment.interestPermil) }}</div>
      </div>
      <div>
        <div class="mit-fin-line-a"> <div> AMOUNT </div> <div> WANTED </div> </div>
        <div class="mit-fin-line-b">{{ investment.amountWanted.toString() }} {{ investment.loanTokenSymbol }}</div>
      </div>
      <div>
        <div class="mit-fin-line-a"> <div> AMOUNT </div> <div> GATHERED </div> </div>
        <div class="mit-fin-line-b">{{ investment.amountInvested.toString() }} {{ investment.loanTokenSymbol }} </div>
      </div>
    </div>
    <div v-for="withdrawal in investment.withdrawals">
      <generic-withdrawal
        v-if="withdrawal.isCollateralBackAfterPayback"
        :withdrawal="withdrawal"
        text="Full collateral after payback:" />
      <generic-withdrawal
        v-if="withdrawal.isLoanBackAfterPayback"
        :withdrawal="withdrawal"
        text="Your investment after payback:" />
      <generic-withdrawal
        v-if="withdrawal.isCollateralBackAfterDefaulted"
        :withdrawal="withdrawal"
        text="Your collateral allowance after defaulting:" />
      <generic-withdrawal
        v-if="withdrawal.isCollateralBackAfterCanceled"
        :withdrawal="withdrawal"
        text="Full collateral after fundraising failed:" />
    </div>
    <withdrawal-button
      v-if="investment.withdrawals && investment.withdrawals.length > 0"
      :loanShortId="investment.id"
      :withdrawals="investment.withdrawals" />
  </div>
</template>

<script lang="ts">
import UserScore from '@/components/common/UserScore';
import { permilsToPercentage } from 'utils/calc';
import GenericWithdrawal from 'components/withdrawal/GenericWithdrawal.vue';
import WithdrawalButton from 'components/withdrawal/WithdrawalButton.vue';

export default {
  name: 'MyInvestments',
  props: ['investment'],
  components: {
    'user-score': UserScore,
    'generic-withdrawal': GenericWithdrawal,
    'withdrawal-button': WithdrawalButton
  },
  methods: {
    permilsToPercentage
  }
};
</script>

<style scoped lang="scss">
.my-investement-tile { width: 400px; margin: 20px; border-radius: 2px; background-color: #ffffff; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.02);
  .mit-details { display: flex; align-items: center; padding: 30px; border-bottom: 1px solid var(--color-white-smoke);
    .mit-details-right { margin-left: 20px;
      .mit-short-desc { font-size: 18px; font-weight: 600; line-height: 1.22; letter-spacing: -0.2px; color: var(--color-black-cod); }
      .mit-user { margin-top: 2px; font-size: 12px; font-weight: 300; color: #858585; }
    }
  }
  .mit-financial-data { display: flex; justify-content: space-between; padding: 23px 30px;  border-bottom: 1px solid var(--color-white-smoke);
    .mit-fin-line-a { font-size: 11px; font-weight: 300; letter-spacing: 0.4px; color: #858585; }
    .mit-fin-line-b { font-size: 13px; font-weight: 600; color: var(--color-black-cod); }
    .mit-fin-line-c { font-size: 10px; font-weight: 300; line-height: 2.2; color: #858585; }
  }
}
</style>
