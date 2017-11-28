import Vue from 'vue';
import { isErrorPage, goToMainPage, goToUnlockMetamaskPage, goToUnsupportedNetworkPage, goToInstallMetamaskPage, goToErrorPage } from '../router';

export interface EventsProvider {
  metamaskNotInstalled(): void;
  metamaskLocked(): void;
  unsupportedNetwork(): void;
  unknownError(): void;
  afterSuccessfulInitialization(): void;
}

/**
 * We are binding events to the global Vue object because
 * we need there access to Vue's this.$rouuer
 */
export function initEvents(vue: Vue): EventsProvider {
  return {
    metamaskNotInstalled: function (): void {
      goToInstallMetamaskPage.call(vue);
    },
    metamaskLocked: function (): void {
      goToUnlockMetamaskPage.call(vue);
    },
    unsupportedNetwork: function (): void {
      goToUnsupportedNetworkPage.call(vue);
    },
    unknownError: function (): void {
      goToErrorPage.call(vue);
    },
    afterSuccessfulInitialization: function (): void {
      if (isErrorPage.call(vue)) {
        goToMainPage.call(vue);
      }
    }
  }
}
