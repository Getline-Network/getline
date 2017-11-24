// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'vue-material/dist/vue-material.css';
import VueMaterial from 'vue-material';

import Vue from 'vue';
import App from './App.vue';
import router, { isErrorPage, goToMainPage, goToUnlockMetamaskPage, goToUnsupportedNetworkPage, goToInstallMetamaskPage, goToErrorPage } from './router';
import API from './api';

import { VueConstructor } from 'vue/types/vue';
import registerPurpleTheme from './theme';

Vue.use(VueMaterial);

registerPurpleTheme(Vue);

Vue.config.productionTip = false;


/* eslint-disable no-new */
var _Vue = new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App },
});

const actions = {
  metamaskNotInstalled: () => goToInstallMetamaskPage.call(_Vue),
  metamaskLocked: () => goToUnlockMetamaskPage.call(_Vue),
  unsupportedNetwork: () => goToUnsupportedNetworkPage.call(_Vue),
  unknownError: () => goToErrorPage.cal(_Vue),
  afterSuccessfulInitialization: () => {
    if (isErrorPage.call(_Vue)) {
      goToMainPage.call(_Vue);
    }
  }
}

window.addEventListener('load', async () => {
  API.init(actions);
});