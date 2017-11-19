const METABACKEND_URL = 'http://0.api.getline.in';
const METABACKEND_NETWORK = '4';
let api;
import { Client, Loan, LoanState } from '../../../getline.ts';

export default {
  init: () => {
    api = new Client(METABACKEND_URL, METABACKEND_NETWORK);
  },
  instance: () => api,
};

export { Loan, LoanState };