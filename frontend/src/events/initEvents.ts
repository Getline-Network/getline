import Vue from 'vue';
import { isErrorPage, goToMainPage, goToUnlockMetamaskPage, goToUnsupportedNetworkPage, goToInstallMetamaskPage, goToErrorPage } from '../router';

export interface EventsProvider {
  metamaskNotInstalled(): void;
  metamaskLocked(): void;
  unsupportedNetwork(): void;
  unknownError(): void;
  afterSuccessfulInitialization(): void;
}

export function initEvents(): EventsProvider {
  return {
    metamaskNotInstalled: goToInstallMetamaskPage,
    metamaskLocked: goToUnlockMetamaskPage,
    unsupportedNetwork: goToUnsupportedNetworkPage,
    unknownError: goToErrorPage,
    afterSuccessfulInitialization: function (): void {
      if (isErrorPage()) {
        goToMainPage();
      }
    }
  }
}
