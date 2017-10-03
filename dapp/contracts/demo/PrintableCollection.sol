pragma solidity ^0.4.11;

import "../tokens/PrintableToken.sol";
import "../common/AccessControl.sol";

// Prints all printable tokens at once
contract PrintableCollection is AccessControl {
    PrintableToken[] tokens = new PrintableToken[](0);

    function PrintableCollection() {}

    function addToken(PrintableToken _token) managerOnly {
        tokens.push(_token);
    }

    function print(address _who) {
        // Expected amount of tokens is expected to be constant after initial initialization
        // so that's fine to have a loop without fear of running out of gas
        for (uint i = 0; i < tokens.length; i++) {
            tokens[i].print(_who);
        }
    }
}