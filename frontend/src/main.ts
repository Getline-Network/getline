// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'vue-material/dist/vue-material.css';
import VueMaterial from 'vue-material';

import Vue from 'vue';
import App from './App.vue';
import router from './router';
import API from './api';
import { Client } from '../../getline.ts';
import { VueConstructor } from 'vue/types/vue';
import registerPurpleTheme from './theme';

Vue.use(VueMaterial);
Vue.use(VueMaterial.MdIcon);

setTimeout(async () => {
  // setTimeout because we are waiting for metamask extenion to inject the web3 object
  API.init(Client);
  // const myAddress = window.web3.eth.accounts[0];
  // console.log(await API.instance().getLoansByOwner(myAddress));  // eslint-disable-line
});

registerPurpleTheme(Vue);

Vue.config.productionTip = false;


/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App },
});
