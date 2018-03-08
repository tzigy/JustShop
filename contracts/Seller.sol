//pragma experimental ABIEncoderV2;
pragma solidity ^0.4.18;

contract Seller {
    
    address private owner;
    
    string public name;
    string private addr;
    string private telephone;
    
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
    
    function Seller(string _name) public {
        owner = msg.sender;
        name = _name;
        addTestProd();
    }
    
    function addTestProd() public {
        
        addProduct(0x2A60DBBFA69C4047DC632D89A496FFB012639109D3B58B82413BBB761F6A9249, 0.1 ether, 20);
        addProduct(0x384C1F0D972635210CBDC822B070AB637645DAA80971D2B2CBCBE3F7BF00FD9E, 0.2 ether, 30);
    }
    
    function addProduct(bytes32 _ipfsAddr, uint _price, uint _quantity) public isOwner() {
        assert(productsAvailable[_ipfsAddr] == false);
        products.push(ProductStruct(_ipfsAddr, _price, _quantity));
        productsAvailable[_ipfsAddr] = true;
    }
    
    function productsCount() view public returns(uint) {
        return products.length;
    }

    function getBroductByIndex(uint _index) view public returns(bytes32, uint, uint) {
        ProductStruct memory currentProduct = products[_index]; 
        return (currentProduct.ipfsAddr, currentProduct.price, currentProduct.unitsAvailable);
    }
}