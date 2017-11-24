import Vue from 'vue';
import Router from 'vue-router';

import RequestLoan from '@/components/borrow/RequestLoan';
import MyLoans from '@/components/borrow/MyLoans';
import InvestBar from '@/components/invest/InvestBar';
import LoanList from '@/components/invest/LoanList/LoanList';
import MyInvestments from '@/components/invest/MyInvestments/MyInvestments';
import Investment from '@/components/invest/Investment';
import UnlockMetamask from '@/components/error/UnlockMetamask';
import BadNetwork from '@/components/error/BadNetwork';
import UnknownError from '@/components/error/UnknownError';
import InstallMetamask from '@/components/error/InstallMetamask';

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
      path: '/my-loans',
      component: MyLoans,
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
});

export function goToMainPage() {
  this.$router.push({ path: "/" });
}

export function goToLoan(id) {
  const path = '/invest/loan/';
  this.$router.push({ path: path + id });
}

export function goToUnlockMetamaskPage() {
  const path = '/error/unlock-metamask/';
  this.$router.push({ path });
}

export function goToUnsupportedNetworkPage() {
  const path = '/error/network/';
  this.$router.push({ path });
}

export function goToInstallMetamaskPage() {
  const path = '/error/install-metamask/';
  this.$router.push({ path });
}

export function goToErrorPage() {
  const path = '/error/unknown/';
  this.$router.push({ path });
}

export function isErrorPage() {
  let path = this.$route.path.split("/");
  return (path && path.length > 0 && path[1] === "error");
}