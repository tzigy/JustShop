//pragma experimental ABIEncoderV2;
pragma solidity ^0.4.18;

contract Seller {
    
    address private owner;
    
    string public name;
    string public addr;
    string public telephone;
    
    modifier isOwner {
        require(owner == msg.sender);
        _;
    }
    
    struct ProductStruct {
        bytes32 ipfsAddr;
        uint price;
        uint unitsAvailable;
    }
    
    ProductStruct[] public products;
    mapping(bytes32 => bool) productsAvailable;
    
    function Seller(string _name, string _addr, string _telephone) public payable {
        owner = msg.sender;
        name = _name;
        addr = _addr;
        telephone = _telephone;
        //addTestProd();
    }
    
    function addTestProd() public {
        
        addProduct(0x2A60DBBFA69C4047DC632D89A496FFB012639109D3B58B82413BBB761F6A9249, 0.1 ether, 20);
        addProduct(0x384C1F0D972635210CBDC822B070AB637645DAA80971D2B2CBCBE3F7BF00FD9E, 0.2 ether, 30);
    }
    
    function addProduct(bytes32 _ipfsAddr, uint _price, uint _quantity) public isOwner() returns (bool) {
        if (!productsAvailable[_ipfsAddr] == false) {
            return false;
        }
        products.push(ProductStruct(_ipfsAddr, _price, _quantity));
        productsAvailable[_ipfsAddr] = true;
        return true;
    }
    
    function addQuantity(bytes32 _ipfsAddr, uint _quantity) public isOwner() returns(bool) {
        if (productsAvailable[_ipfsAddr] == false) {
            return false;
        }
        for (uint i = 0; i < products.length; i++) {
            if (products[i].ipfsAddr == _ipfsAddr) { 
                products[i].unitsAvailable += _quantity;
                return true;
                break;
            }
        }    
        return false;
    }
    
    function changePrice(bytes32 _ipfsAddr, uint _newPrice) public isOwner() returns(bool) {
        if (productsAvailable[_ipfsAddr] == false) {
            return false;
        }
        for (uint i = 0; i < products.length; i++) {
            if (products[i].ipfsAddr == _ipfsAddr) {
                products[i].price = _newPrice;
                return true;
            }
        }    
        return false;
    }
    
    function productsCount() view public returns(uint) {
        return products.length;
    }

    function getBroductByIndex(uint _index) view public returns(bytes32, uint, uint) {
        ProductStruct memory currentProduct = products[_index]; 
        return (currentProduct.ipfsAddr, currentProduct.price, currentProduct.unitsAvailable);
    }
    
    function deposit() public payable {}
    
    function getMyMoney(uint amount) public isOwner() {
        assert(amount <= this.balance);
        owner.transfer(amount);
    }
    
    function getBalance() view public isOwner() returns (uint) {
        return this.balance;
    }
    
    function () public payable {}
}