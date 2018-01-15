<template>
  <div class="my-loan-tile">
    <div class="mlt-details">
        <div class="mlt-short-desc">{{ loan.description || "No description provided" }}</div>
    </div>
    <div class="mlt-financial-data">
      <div>
        <div class="mlt-fin-line-a"> AMOUNT WANTED </div>
        <div class="mlt-fin-line-b">{{ formatBigNumber(loan.amountWanted) }} {{ loan.loanTokenSymbol }}</div>
      </div>
      <div>
        <div class="mlt-fin-line-a"> RATE </div>
        <div class="mlt-fin-line-b">{{ permilsToPercentage(loan.interestPermil) }}</div>
      </div>
      <div>
        <div class="mlt-fin-line-a"> AMOUNT GATHERED </div>
        <div class="mlt-fin-line-b mlt-fin-line-right"> {{ formatBigNumber(loan.amountInvested) }} {{ loan.loanTokenSymbol }}</div>
      </div>
    </div>
    <fundraising-section v-if="loan.isFundraising" :loan="loan" />
    <collateral-section v-if="loan.isCollateralCollection" :loan="loan"  />
    <payback-section v-if="loan.isPayback" :loan="loan"  />
    <div v-for="withdrawal in loan.withdrawals">
      <generic-withdrawal
        v-if="withdrawal.isCollateralBackAfterPayback" 
        :withdrawal="withdrawal"
        :tokenSymbol="loan.loanTokenSymbol"
        text="COLLATERAL TO RECEIVE " />
      <generic-withdrawal
         v-if="withdrawal.isLoanBackAfterPayback"
         :withdrawal="withdrawal"
         :tokenSymbol="loan.loanTokenSymbol"
         text="THE LOAN WAS PAID BACK. GET PAYBACK" />
      <generic-withdrawal
         v-if="withdrawal.isCollateralBackAfterDefaulted"
         :withdrawal="withdrawal"
         :tokenSymbol="loan.loanTokenSymbol" text="THE LOAN IS DEFAULTED. GET COLLATERAL:" />
      <generic-withdrawal
        v-if="withdrawal.isCollateralBackAfterCanceled"
        :withdrawal="withdrawal"
        :tokenSymbol="loan.loanTokenSymbol"
        text="THE LOAN HAS NOT RAISED FUNDS ON TIME. GET YOUR COLLATERAL BACK" />
    </div>
    <withdrawal-button v-if="loan.withdrawalAmount.gt(0)" :amount="loan.withdrawalAmount" :loan="loan" />
  </div>
</template>

<script lang="ts">

import { permilsToPercentage, formatBigNumber } from 'utils/calc';
import CollateralSection from './Collateral.vue';
import PaybackSection from './Payback.vue';
import FundraisingSection from './Fundraising.vue';
import FinishedSection from './Finished.vue';
import GenericWithdrawal from './GenericWithdrawal.vue';
import WithdrawalButton from './WithdrawalButton.vue';

export default {
  name: 'MyLoanTile',
  props: ['loan'],
  components: {
    'payback-section': PaybackSection,
    'collateral-section': CollateralSection,
    'fundraising-section': FundraisingSection,
    'finished-section': FinishedSection,
    'generic-withdrawal': GenericWithdrawal,
    'withdrawal-button': WithdrawalButton
  },
  methods: {
    formatBigNumber,
    permilsToPercentage,
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
    .mlt-fin-line-right { text-align: right; }
  }
}
</style>
