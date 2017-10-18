pragma solidity ^0.4.4;

contract Migrations {
  address public owner;
  uint public last_completed_migration;

  modifier restricted() {
    require(msg.sender == owner);
    _;
  }

  function Migrations() {
    owner = msg.sender;
  }

  function setCompleted(uint completed) restricted {
    last_completed_migration = completed;
  }

  function upgrade(address newAddress) restricted {
    Migrations upgraded = Migrations(newAddress);
    upgraded.setCompleted(last_completed_migration);
  }
}
