<template>
  <div id="app">
    <top-panel></top-panel>
    <router-view/>
    <div class="dotted">
    </div>
  </div>
</template>

<script>
import TopPanel from '@/components/common/TopPanel';

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
.dotted { position: absolute; top: 0; z-index: -1; height: 300px; width: 100%; padding: 2.25em 1.6875em;
  background-image: -webkit-repeating-radial-gradient(center center, rgba(0,0,0,.2), rgba(0,0,0,.2) 1px, transparent 1px, transparent 100%);
  background-image: -moz-repeating-radial-gradient(center center, rgba(0,0,0,.2), rgba(0,0,0,.2) 1px, transparent 1px, transparent 100%);
  background-image: -ms-repeating-radial-gradient(center center, rgba(0,0,0,.2), rgba(0,0,0,.2) 1px, transparent 1px, transparent 100%);
  background-image: repeating-radial-gradient(center center, rgba(0,0,0,.2), rgba(0,0,0,.2) 1px, transparent 1px, transparent 100%);
  -webkit-background-size: 10px 10px;
  -moz-background-size: 10px 10px;
  background-size: 10px 10px;
  opacity: 0.2;
  }
</style>
