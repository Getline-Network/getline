module.exports = {
  mocha: {
    reporter: "mocha-multi-reporters",
    reporterOptions: {
      configFile: "mocha-multi-reporters.json",
    },
  },
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      gas: 100000000,
    },
    rinkeby: {
      host: "localhost",
      port: 8545,
      network_id: 4,
      gas: 4612388
    }
  }
};
