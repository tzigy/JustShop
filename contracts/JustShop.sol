pragma solidity ^0.4.18;


contract JustShop {

    address private owner;
    address[] private sellers;
    mapping(address => bool) sellersAvailable;
    address[] private wannaBeSellers;
    uint private commision = 30;
    
    event ProductPurchased(address _buyer, address _seller, bytes32 _product, uint _price); 
    
    modifier isOwner() {
        require(owner == msg.sender);
        _;
    }

    function JustShop() public payable {
        owner = msg.sender;
    }
    
    function sellersCount() view public returns(uint) {
        return sellers.length;
    }
    
    function getSellerByIndex(uint _index) view public returns(address) {
        return sellers[_index];
    }
    
    function addSeller(address _newSeller) public isOwner() returns (bool) {
        if (!sellersAvailable[_newSeller] == false) {
            return false;
        }
        sellers.push(_newSeller);
        sellersAvailable[_newSeller] = true;
        return true;
    }
    
    function addWannaBeSeller(address _wannaBeSeller) public returns (bool) {
        if (sellersAvailable[_wannaBeSeller] == true) {
            return false;
        }
        wannaBeSellers.push(_wannaBeSeller);
        return true;
    }
    
    function acceptWannaBeSeller(address _wannaBeSeller) public isOwner() returns(bool) {
        if (sellersAvailable[_wannaBeSeller] == true) {
            return false;
        }
        
        for (uint i = 0; i < wannaBeSellers.length; i++) {
            if (wannaBeSellers[i] == _wannaBeSeller) {  
                sellers.push(_wannaBeSeller);
                sellersAvailable[_wannaBeSeller] = true;
                return true;
            }
        }
        return false;
    }
    
    function getBalance() view public isOwner() returns(uint) {
        address contractAddr = this;
        return contractAddr.balance;
    }
    
    function buyProduct(address _buyer, address _seller, bytes32 _productId) public payable {
        require(sellersAvailable[_seller] == true);
        uint amount = (msg.value * (100 - commision)) / 100;
        _seller.transfer(amount);
        ProductPurchased(_buyer, _seller, _productId, msg.value); 
    }
    
    function getMyMoney(uint amount) public isOwner() {
        address contractAddr = this;
        require(amount <= contractAddr.balance);
        owner.transfer(amount);
    }
    
    function deposit() public payable {
    
    }
    
    function () public payable {}
}