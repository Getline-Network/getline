<template>
  <div class="my-investments">
    <no-investments />
  </div>
</template>

<script>
import NoInvestments from './NoInvestments';

export default {
  name: 'MyInvestments',
  components: {
    'no-investments': NoInvestments,
  },
};
</script>
<style scoped lang="scss">
.my-investments { width: calc(100% - 200px); min-width: 570px; margin: 40px auto;
  .ll-title { margin: 54px 0px 30px 25px; font-size: 28px; line-height: 1; letter-spacing: -0.3px; color: var(--color-black-cod); }
  .ll-container { margin-bottom: 40px; border-radius: 2px; background-color: #ffffff; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.02);
    .ll-th { height: 44px; font-size: 11px; font-weight: 300; letter-spacing: 0.4px; color: #858585; border-bottom: 1px solid var(--color-white-smoke); }
    .ll-td { height: 66px; font-size: 12px; text-align: left; color: #1c1c1c; border-bottom: 1px solid var(--color-white-smoke); cursor: pointer;
      &.ll-score { width: 300px; }
      &.ll-time { font-weight: 300; line-height: 1.83; color: #858585; }
    }
  }
}
</style>
