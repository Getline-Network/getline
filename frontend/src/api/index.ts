const METABACKEND_URL = 'http://0.api.getline.in';
const METABACKEND_NETWORK = '4';
import { Client, Loan, LoanState } from '../../../getline.ts';

interface Waiter {
  (resolve: Client): void
}

let api: Client | undefined;
let waiters: Array<Waiter> = [];

export default {
  init: () => {
    api = new Client(METABACKEND_URL, METABACKEND_NETWORK);
    api.initialize().then(()=>{
        // Wake up sleepers waiting for API.
        for (let i = 0; i < waiters.length; i++) {
          waiters[i](api);
        }
    });
  },
  instance: (): Promise<Client> => {
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

export { Loan, LoanState };
