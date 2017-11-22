module.exports = {
  mocha: {
    reporter: "mocha-multi-reporters",
    reporterOptions: {
      configFile: "mocha-multi-reporters.json",
    },
  },
  networks: {
    rinkeby: {
      host: "ganache",
      port: 8545,
      network_id: "4"
    },
  }
};
