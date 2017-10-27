import Vue from 'vue';
import Router from 'vue-router';

import RequestLoan from '@/components/borrow/RequestLoan';
import InvestBar from '@/components/invest/InvestBar';
import LoanList from '@/components/invest/LoanList/LoanList';
import MyInvestments from '@/components/invest/MyInvestments/MyInvestments';
import Investment from '@/components/invest/Investment';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '', redirect: '/invest',
    },
    {
      path: '/borrow',
      component: RequestLoan,
    },
    {
      path: '/invest/loan/:loanId',
      component: Investment,
      hideInvestBar: true,
    },
    {
      path: '/invest',
      component: InvestBar,
      children: [
        {
          path: '', redirect: '/invest/loan-list',
        },
        {
          path: 'loan-list',
          component: LoanList,
        },
        {
          path: 'my-investments',
          component: MyInvestments,
        },
      ],
    },
  ],
});

export function goToLoan(id) {
  const path = '/invest/loan/';
  this.$router.push({ path: path + id });
}
