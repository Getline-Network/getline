const METABACKEND_URL = 'https://0.api.getline.in';
const METABACKEND_NETWORK = '4';
let api;

export default {
  init: (Client) => {
    api = new Client(METABACKEND_URL, METABACKEND_NETWORK);
  },
  getLoansByOwner: () => api.getLoansByOwner('0xb1d2c09091a42be70e9f5f17830b6c62ef7cd90b'),
  addNewLoan: () => api.addNewLoan(0, 0, 0, 0, 0),
};
