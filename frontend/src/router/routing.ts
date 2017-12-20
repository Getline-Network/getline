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
import PrintDemoTokens from '@/components/demo-tokens/PrintDemoTokens.vue';

const routing: RouterOptions = {
  routes: [
    {
      path: '', redirect: '/invest',
    },
    {
      path: '/print',
      component: PrintDemoTokens,
      meta: { title: 'Print some test tokens' }

    },
    {
      path: '/borrow',
      component: RequestLoan,
      meta: { title: 'Request a loan' }

    },
    {
      path: '/my-loans',
      component: MyLoans,
      meta: { title: 'My loans' }

    },
    {
      path: '/invest/loan/:shortId',
      component: Investment,
      props: { hideInvestBar: true },
      meta: { title: 'Invest in a loan' }
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
          meta: { title: 'List of loans' }
        },
        {
          path: 'my-investments',
          component: MyInvestments,
          meta: { title: 'My investments' }
        },
      ],
    },
    {
      path: '/error/install-metamask/',
      component: InstallMetamask,
      meta: { title: 'Please install metamask' }
    },
    {
      path: '/error/unlock-metamask/',
      component: UnlockMetamask,
      meta: { title: 'Please unlock metamask' }
    },
    {
      path: '/error/network/',
      component: BadNetwork,
      meta: { title: 'Bad network' }
    },
    {
      path: '/error/unknown/',
      component: UnknownError,
      meta: { title: 'Unknown error' }
    },
  ],
}

export default routing;