import { RouterOptions } from 'vue-router';

import RequestLoan from '@/components/borrow/RequestLoan.vue';
import MyLoans from '@/components/borrow/MyLoans.vue';
import InvestBar from '@/components/invest/InvestBar.vue';
import LoanList from '@/components/invest/LoanList/LoanList.vue';
import MyInvestments from '@/components/invest/MyInvestments/MyInvestments.vue';
import Investment from '@/components/invest/Investment.vue';
import UnlockMetamask from '@/components/error/UnlockMetamask.vue';
import BadNetwork from '@/components/error/BadNetwork.vue';
import UnknownError from '@/components/error/UnknownError.vue';
import InstallMetamask from '@/components/error/InstallMetamask.vue';

const routing: RouterOptions = {
  routes: [
    {
      path: '', redirect: '/invest',
    },
    {
      path: '/borrow',
      component: RequestLoan,
    },
    {
      path: '/my-loans',
      component: MyLoans,
    },
    {
      path: '/invest/loan/:shortId',
      component: Investment,
      props: { hideInvestBar: true },
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
    {
      path: '/error/install-metamask/',
      component: InstallMetamask,
    },
    {
      path: '/error/unlock-metamask/',
      component: UnlockMetamask,
    },
    {
      path: '/error/network/',
      component: BadNetwork,
    },
    {
      path: '/error/unknown/',
      component: UnknownError,
    },
  ],
}

export default routing;