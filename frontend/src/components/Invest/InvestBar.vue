<template>
  <div>
    <div class="invest-bar">
      <router-link to="/invest/loan-list" class="ib-option"> Loan listing </router-link>
      <router-link to="/invest/my-investments" class="ib-option"> My investments </router-link>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'InvestBar',
};
</script>

<style scoped lang="scss">
.invest-bar { display: flex; justify-content: center; align-items: center; height: 58px; background-color: #ffffff; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.02); border-top: 1px solid var(--color-white-smoke);
  a.ib-option { display: flex; align-items: center; height: 34px; margin: 0 15px; padding: 0 26px; font-size: 12px; text-align: left; color: #1c1c1c; text-decoration: none;
    &.router-link-active { border-radius: 3px; background-color: #f8f8f8; }
  }
}
</style>
