import { EventsProvider } from '../events';
import { ProviderLocked, ProviderOnUnsupportedNetwork, ProviderInitializeError } from '../../../getline.ts';

export function handleInitError(error, events: EventsProvider) {
  switch (error.constructor) {
    case ProviderLocked:
      console.log("Metamask locked.")
      events.metamaskLocked();
      break;
    case ProviderOnUnsupportedNetwork:
      console.log("Metamask on unsupported network.")
      events.unsupportedNetwork();
      break;
    case ProviderInitializeError:
      console.log("Metamask error (is it installed?): " + error);
      events.metamaskNotInstalled();
      break;
    default:
      console.log("Unknown error: " + error);
      events.unknownError()
  }
}