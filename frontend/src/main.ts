// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'vue-material/dist/vue-material.css';
import VueMaterial from 'vue-material';

import Vue from 'vue';
import App from './App.vue';
import router from './router';
import API from './api';
import store from './store';
import { initEvents } from './events';
import registerPurpleTheme from './theme';

Vue.use(VueMaterial);

registerPurpleTheme(Vue);

Vue.config.productionTip = false;

/* eslint-disable no-new */
const vue = new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App },
});

window.addEventListener('load', async () => {
  API.init(initEvents(vue));
});