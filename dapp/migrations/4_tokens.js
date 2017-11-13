var Bluebird = require('bluebird'); 

var PrintableToken = artifacts.require('./tokens/PrintableToken.sol');

module.exports = function(deployer) {
  return deployer
    .then(() => deployer.deploy(PrintableToken, "Sample Printable Token", 4, "SPT", 1000000));
};
