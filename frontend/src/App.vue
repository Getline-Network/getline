<template>
  <div id="app">
    <top-panel></top-panel>
    <router-view/>
  </div>
</template>
<script>
import TopPanel from '@/components/TopPanel';

export default {
  name: 'app',
  components: {
    'top-panel': TopPanel,
  },
};
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/icon?family=Material+Icons");
@import url('https://fonts.googleapis.com/css?family=Montserrat');
* {
  margin: 0;
  padding: 0;
  font-family: Montserrat;
}
body {
  background-color: var(--color-white-smoke) !important;
}
:root {
  --color-black-cod: #101010;
  --color-blurple: #6847d6;
  --color-white-smoke: #f4f4f4;
  --color-greyish: #b6b6b6;
  --color-grey-warm: #707070;
  --purpleish-blue: #7249f7;
}
</style>
