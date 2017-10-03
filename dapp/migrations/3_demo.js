var Bluebird = require('bluebird'); 

var PrintableToken = artifacts.require('./tokens/PrintableToken.sol');
var AutoInvestor = artifacts.require('./demo/AutoInvestor.sol');
var PrintableCollection = artifacts.require('./demo/PrintableCollection.sol');

var DEMO_TOKENS = [
  ["Getline Test Collateral", 4, "GTC", 1000000],
  ["Getline Test Token A", 4, "GTA", 1000000],
  ["Getline Test Token B", 4, "GTB", 1000000]
];

module.exports = function(deployer) {
  var tokenAddresses = null;
  return deployer
    .then(() => deployer.logger.log('Deploying tokens'))
    .then(() =>
      Bluebird.mapSeries(
        DEMO_TOKENS,
        (params) => PrintableToken.new(...params)
      )
    )
    .then((tokens) => tokenAddresses = tokens.map((token) => token.address))
    .then(() => deployer.logger.log("Tokens deployed"))
    .then(() => deployer.deploy(PrintableCollection))
    .then(() => deployer.logger.log('Adding tokens for minting'))
    .then(PrintableCollection.deployed)
    .then((instance) => Bluebird.mapSeries(
      tokenAddresses,
      (token) => instance.addToken(token))
    )
    .then(() => deployer.logger.log('Tokens added to minting'))
    .then(() => deployer.deploy(AutoInvestor, ...tokenAddresses));
};
