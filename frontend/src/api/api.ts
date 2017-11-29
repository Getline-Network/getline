import METABACKEND from './metabackend';
import { Client } from './index';
import { EventsProvider } from '../events';
import { handleInitError } from './errors';

interface Waiter {
  (resolve: Client): void
}

let api: Client | undefined;
let waiters: Array<Waiter> = [];

export default {
  init: async function (events: EventsProvider): Promise<void> {
    try {
      api = new Client(METABACKEND.URL, METABACKEND.NETWORK);
      await api.initialize();
      events.afterSuccessfulInitialization();
      // Wake up sleepers waiting for API.
      for (let i = 0; i < waiters.length; i++) {
        waiters[i](api);
      }
    } catch (error) {
      handleInitError(error, events);
    }
  },
  instance: function (): Promise<Client> {
    return new Promise<Client>((resolve, reject) => {
      // Have we not initialized yet? Return and wait to be called when we are.
      if (api == undefined) {
        waiters.push(resolve);
        return;
      }
      // If we are initialized, just resolve immediately.
      resolve(api);
    });
  },
};