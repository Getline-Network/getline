import Vue from 'vue';
import Router from 'vue-router';

import routing from './routing';

Vue.use(Router);

export default new Router(routing);
export * from './redirects';
