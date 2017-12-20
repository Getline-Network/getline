// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'vue-material/dist/vue-material.css';
import VueMaterial from 'vue-material';

import Vue from 'vue';
import App from './App.vue';
import router from './router';
import { bindRedirects } from './router/redirects';

import API from './api';
import store from './store';
import { initEvents } from './events';
import registerPurpleTheme from './theme';
import { SET_LOGGED_IN_VIEW_ACTION } from 'store/account/actions';

Vue.use(VueMaterial);

registerPurpleTheme(Vue);

Vue.config.productionTip = false;

/* eslint-disable no-new */
const vue: Vue = new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App },
});

bindRedirects(vue);

window.addEventListener('load', async () => {
  API.init(initEvents(vue));
});