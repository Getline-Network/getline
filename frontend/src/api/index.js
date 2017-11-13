const METABACKEND_URL = 'http://0.api.getline.in';
const METABACKEND_NETWORK = '4';
let api;

export default {
  init: (Client) => {
    api = new Client(METABACKEND_URL, METABACKEND_NETWORK);
  },
  instance: () => api,
};
