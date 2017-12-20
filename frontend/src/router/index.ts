import Vue from 'vue';
import Router from 'vue-router';

import routing from './routing';

Vue.use(Router);

const router = new Router(routing);
router.beforeEach((to, from, next) => {
  document.title = to.meta.title
  next()
})

export default router;
export * from './redirects';
