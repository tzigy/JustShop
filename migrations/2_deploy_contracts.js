var Seller = artifacts.require("./Seller.sol");
var JustShop = artifacts.require("./JustShop.sol");

module.exports = function(deployer) {
  deployer.deploy(Seller, "Best Music Shop", "Opalchenska 40a", "+359(888) 566 511", {gas: 4500000});
  deployer.deploy(Seller, "One More Music Shop", "JustStreet 28", "+359(888) 587 511", {gas: 4500000});
  deployer.deploy(Seller, "Best In Town Music Shop", "BestStreet 15", "+359(888) 597 555", {gas: 4500000});
  deployer.deploy(JustShop, {gas: 4500000}); 
};
