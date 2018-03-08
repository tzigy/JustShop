var Seller = artifacts.require("./Seller.sol");
var JustShop = artifacts.require("./JustShop.sol");

module.exports = function(deployer) {
  deployer.deploy(Seller, "Best Music Shop");
  deployer.deploy(JustShop); 
};
