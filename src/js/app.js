import "../styles/app.css";
import "../styles/heroic-features.css";
import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import $ from 'jquery';
import ShopService from './services/shop_service.js';
import SellerService from './services/seller_service.js';
import ProductTemplate from './templates/productTemplate.hbs';

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import seller_artifacts from '../../build/contracts/Seller.json'
import shop_artifacts from '../../build/contracts/JustShop.json'

var Seller = contract(seller_artifacts);

var Shop = contract(shop_artifacts);

var accounts;
var account;

window.App = {  
    start: function() {
      var self = this;      
      // Bootstrap the MetaCoin abstraction for Use.
      Seller.setProvider(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
      Shop.setProvider(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
  
      // Get the initial account balance so it can be displayed.
      web3.eth.getAccounts(function(err, accs) {
        if (err != null) {
          alert("There was an error fetching your accounts.");
          return;
        }
  
        if (accs.length == 0) {
          alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
          return;
        }
  
        accounts = accs;
        account = accounts[0];     
      });
    },
	showShopPage: function() {
      var self = this;            
    
        //this.setStatus("Initiating transaction... (please wait)");
        
        var shop ={};
        shop.sellers = [];
        ShopService.getAllSellersIds(Shop.at("0xf08df3efdd854fede77ed3b2e515090eee765154"))
          .then((sellerList) => {
              console.log(sellerList);
              var s = sellerList.map(addr => SellerService.getSeller(Seller.at(addr), addr));
              return Promise.all(s);
            })
            .then(sellerProdList => {
                for (let index = 0; index < sellerProdList.length; index++) {
                  shop.sellers.push(sellerProdList[index]);                  
                }
                App.insertTemplate(shop, ProductTemplate);
            })
    },
    insertTemplate: function(objectToInsert, template){
     var cont = document.getElementById("main");
     cont.innerHTML = template(objectToInsert);
    
  },
  };
  
  window.addEventListener('load', function() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)    
    if (typeof web3 !== 'undefined') {
      console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
      // Use Mist/MetaMask's provider
      window.web3 = new Web3(web3.currentProvider);
    } else {
      console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"));
    }
      
    App.start();
  });