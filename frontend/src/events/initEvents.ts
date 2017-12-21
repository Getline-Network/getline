import Vue from 'vue';
import { isErrorPage, goToMainPage, goToUnlockMetamaskPage, goToUnsupportedNetworkPage, goToInstallMetamaskPage, goToErrorPage } from '../router';
import { SET_LOGGED_IN_VIEW_ACTION } from 'store/account/actions';

function onLoggedIn(cb) {
  this.$store.dispatch(SET_LOGGED_IN_VIEW_ACTION);
}

export interface EventsProvider {
  metamaskNotInstalled(): void;
  metamaskLocked(): void;
  unsupportedNetwork(): void;
  unknownError(): void;
  afterSuccessfulInitialization(): void;
}

export function initEvents(vue): EventsProvider {
  return {
    metamaskNotInstalled: goToInstallMetamaskPage,
    metamaskLocked: goToUnlockMetamaskPage,
    unsupportedNetwork: goToUnsupportedNetworkPage,
    unknownError: goToErrorPage,
    afterSuccessfulInitialization: function (): void {
      onLoggedIn.call(vue);
      if (isErrorPage()) {
        goToMainPage();
      }
    }
  }
}
