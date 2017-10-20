module.exports = {
  mocha: {
    reporter: "mocha-multi-reporters",
    reporterEnabled: "mocha-junit-reporter, spec",
  },
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
      host: "localhost",
      port: 8545,
      network_id: 4,
      gas: 4612388
    }
  }
};
