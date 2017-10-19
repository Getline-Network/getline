pragma solidity ^0.4.11;


library Math {
    function min(uint a, uint b) returns (uint) {
        if (a < b)
            return a;
        else
            return b;
    }
}
