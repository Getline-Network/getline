<template>
  <div class="top-panel">
    <div class="tp-logo">
      <div class="tp-getline-text"> getline </div>
      <div class="tp-invest-text-container">
        <div class="tp-invest-text"> INVEST </div>
      </div>
    </div>
    <div class="tp-menu-container" v-if="account.loggedIn">
      <router-link class="tp-menu-text" to="/invest"> INVEST </router-link>
      <router-link class="tp-menu-text" to="/borrow"> BORROW </router-link>
      <router-link class="tp-menu-text" to="/my-loans"> MY LOANS </router-link>
    </div>
    <balance v-show="account.loggedIn && !account.errorReceivingBalance" />
    <div class="tp-balance-error" v-if="account.errorReceivingBalance"> Could not retrieve balance. </div>
    <div class="tp-gap-filler" v-if="!account.loggedIn" />
  </div>
</div>
</template>

<script lang="ts">
import Balance from 'components/balance/Balance.vue';
import { mapState } from 'vuex';
import { StateT } from 'store';

export default {
  name: 'TopPanel',
  components: {
    'balance': Balance,
  },
  computed: {
    ...mapState({
      account: (state:StateT) => state.account,
    })
  }
};
</script>

<style scoped lang="scss">
.top-panel { display: flex; justify-content: space-around; align-items: center; height: 98px; background-color: #ffffff; box-shadow: 0 2px 36px 0 rgba(0, 0, 0, 0.04), 0 2px 11px 0 rgba(0, 0, 0, 0.02);
  .tp-logo {
    .tp-getline-text { padding: 0 5px; font-size: 22px; font-weight: 600; letter-spacing: 1px; color: var(--color-black-cod); }
    .tp-invest-text-container { display: flex; justify-content: flex-end; margin-top: -5px;
      .tp-invest-text { width: 40px; font-size: 10px; font-weight: 600; letter-spacing: 0.4px; color: var(--color-black-cod); }
    }
  }
  .tp-menu-container { display: flex; align-items: center; width: 60%; height: 100%;
    a.tp-menu-text { display: flex; height: 100%; align-items: center; padding: 0 15px; font-size: 11px; font-weight: 600; text-align: center; text-decoration: none; color: #606060;
      &.router-link-active { border-bottom: 3px solid var(--purpleish-blue); color: var(--purpleish-blue); }
    }
  }
  .tp-profile { display: flex;
    .tp-profile-photo { width: 42px; height: 42px; }
    .tp-profile-text { display: flex; flex-direction: column; justify-content: center; margin: 0 15px;
      .tp-profile-text-name { font-size: 13px; text-align: left; color: var(--color-black-cod); }
      .tp-profile-text-settings { font-size: 11px; font-weight: 300; letter-spacing: 0.4px; color: #858585; }
    }
  }
  .tp-gap-filler { width: 70% }
  .tp-balance-error { max-width: 250px; text-align: right; font-size: 13px; color: #ff5722; letter-spacing: .01em; }
}
</style>
