import Vue from 'vue';
import Router from 'vue-router';
import RequestLoan from '@/components/RequestLoan';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/borrow',
      component: RequestLoan,
    },
  ],
});
