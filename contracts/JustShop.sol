pragma solidity ^0.4.18;


contract JustShop {

    address private owner;
    address[] private sellers;
    mapping(address => bool) sellersAvailable;
    
    modifier isOwner() {
        require(owner == msg.sender);
        _;
    }

    function JustShop() public {
        owner = msg.sender;
    }
    
    function sellersCount() view public returns(uint) {
        return sellers.length;
    }
    
    function getSellerByIndex(uint _index) view public returns(address) {
        return sellers[_index];
    }
    
    function addSeller(address _newSeller) public isOwner() {
        require(sellersAvailable[_newSeller] == false);
        sellers.push(_newSeller);
        sellersAvailable[_newSeller] = true;
        
    }
}