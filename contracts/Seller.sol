//pragma experimental ABIEncoderV2;
pragma solidity ^0.4.18;

contract Seller {
    
    address private owner;
    
    bytes32 public name;
    bytes32 public addr;
    bytes32 public phone;
    
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
    
    function Seller(bytes32 _name, bytes32 _addr, bytes32 _phone) public payable {
        owner = msg.sender;
        name = _name;
        addr = _addr;
        phone = _phone;
        //addTestProd();
    }
    
    function addTestProd1() public {
        addProduct(0x2A60DBBFA69C4047DC632D89A496FFB012639109D3B58B82413BBB761F6A9249, 0.1 ether, 20);
        addProduct(0x384C1F0D972635210CBDC822B070AB637645DAA80971D2B2CBCBE3F7BF00FD9E, 0.2 ether, 30);
    }
    
    function addTestProd2() public {
        addProduct(0x82EA491AD44C34AA3FEF028303030DF8F3180C6333BAE2FE189885410C08FCED, 0.15 ether, 10);
        addProduct(0x629EDA13AE31C8E62384FC2C22D1C3775CC0CE8521E69B253390BB0AC78E3A9F, 0.22 ether, 50);
    }
    
    function addTestProd3() public {
        addProduct(0x8D2B760A314D105228C93A8351C821B192D32E183673641B000D26392EEBEB56, 0.31 ether, 22);
    }
    
    function getContact() view public returns(bytes32, bytes32, bytes32){
        return (name, addr, phone);
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
        require(amount <= this.balance);
        owner.transfer(amount);
    }
    
    function getBalance() view public isOwner() returns (uint) {
        return this.balance;
    }
    
    function () public payable {}
}