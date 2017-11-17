<template>
  <div id="app">
    <top-panel />
    <router-view />
    <dotts />
  </div>
</template>

<script>
import TopPanel from '@/components/common/TopPanel.vue';
import Dotts from '@/components/common/Dotts.vue';

export default {
  name: 'app',
  components: {
    'top-panel': TopPanel,
    dotts: Dotts,
  },
};
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/icon?family=Material+Icons");
@import url('https://fonts.googleapis.com/css?family=Montserrat');
* { margin: 0; padding: 0; font-family: Montserrat; }
body { background-color: var(--color-white-smoke) !important; }
:root {
  --color-black-cod: #101010;
  --color-blurple: #6847d6;
  --color-white-smoke: #f4f4f4;
  --color-greyish: #b6b6b6;
  --color-grey-warm: #707070;
  --purpleish-blue: #7249f7;
}
</style>
