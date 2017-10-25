<template>
  <div class="loan-list">
    <div class="ll-title"> Loan listing </div>
    <no-loans />
  </div>
</template>

<script>
import NoLoans from './NoLoans';

export default {
  name: 'LoanList',
  components: {
    'no-loans': NoLoans,
  },
};
</script>
<style scoped lang="scss">
.loan-list { width: calc(100% - 200px); min-width: 570px; margin: 0 auto;
  .ll-title { margin: 54px 0px 30px 25px; font-size: 28px; line-height: 1; letter-spacing: -0.3px; color: var(--color-black-cod); }
}
</style>
