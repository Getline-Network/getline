pragma solidity ^0.4.11;

import "./IAtestor.sol";

contract MockAtestor is IAtestor {
    bool result;

    function MockAtestor(bool _result) {
        result = _result;
    }
    
    function isVerified(address _checkedUser) constant returns (bool success) {
        return result;
    }
}