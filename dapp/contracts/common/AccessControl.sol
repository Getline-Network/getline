pragma solidity ^0.4.11;


contract AccessControl {
    mapping(address => bool) public admins;
    mapping(address => bool) public managers;
    
    modifier adminOnly() {
        require(admins[msg.sender] == true);

        _;
    }

    modifier managerOnly() {
        require(managers[msg.sender] == true || admins[msg.sender] == true);

        _;
    }

    function AccessControl() {
        admins[msg.sender] = true;
    }

    function addAdmin(address newAdmin) adminOnly {
        if (managers[newAdmin] == true)
            removeManager(newAdmin);
            
        admins[newAdmin] = true;
    }

    function addManager(address newManager) adminOnly {
        if (admins[newManager] == true)
            removeAdmin(newManager);
        
        managers[newManager] = true;
    }

    function removeAdmin(address oldAdmin) adminOnly {
        delete admins[oldAdmin];
    }

    function removeManager(address oldManager) adminOnly {
        delete managers[oldManager];
    }
}
