import "../styles/app.css";
import "../styles/heroic-features.css";
import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import $ from 'jquery';
import ShopService from './services/shop_service.js';
import SellerService from './services/seller_service.js';
import ProductTemplate from './templates/productTemplate.hbs';
import AddProductTemplate from './templates/addProductTemplate.hbs';
import SellersTemplate from './templates/sellersTemplate.hbs';

// Import libraries we need.
import { default as Web3 } from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import seller_artifacts from '../../build/contracts/Seller.json'
import shop_artifacts from '../../build/contracts/JustShop.json'

const ipfsAPI = require('ipfs-api');
const ipfs = ipfsAPI({ host: 'localhost', port: '5001', protocol: 'http' })

var Seller = contract(seller_artifacts);
var Shop = contract(shop_artifacts);
const shopAddr = "0x825be2f92de542f4bc7581c75154138677313278";

var accounts;
var account;

window.App = {
  start: function () {
    var self = this;
    // Bootstrap the MetaCoin abstraction for Use.
    // Seller.setProvider(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
    // Shop.setProvider(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
     Seller.setProvider(new Web3.providers.HttpProvider('https://ropsten.infura.io/'));
     Shop.setProvider(new Web3.providers.HttpProvider('https://ropsten.infura.io/'));

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function (err, accs) {
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

      App.renderShopMainPage();
    });
  },

  renderShopMainPage: function () {
    var self = this;
    var shop = {};
    shop.sellers = [];
    ShopService.getAllSellersIds(Shop.at(shopAddr))
      .then((sellerList) => {
        var s = sellerList.map(addr => SellerService.getSellerByAddr(Seller.at(addr), addr));
        return Promise.all(s);
      })
      .then(sellerProdList => {
        for (let index = 0; index < sellerProdList.length; index++) {
          shop.sellers.push(sellerProdList[index]);
        }
        App.insertTemplate(shop, ProductTemplate);
      })
  },
  insertTemplate: function (objectToInsert, template) {
    var pageContent = document.getElementById("page-content");
    pageContent.innerHTML = template(objectToInsert);
  },

  buyProduct: function (sellerAddr, prodId, price) {
    console.log("1");
    ShopService.buyProduct(Shop.at(shopAddr), sellerAddr, prodId, price)
      .then((transactionReceipt) => {
        // return transactionReceipt.tx;
        return ShopService.waitTransactionFinished(transactionReceipt.tx)
      })
      .then((blockNr) => console.log("Transaction mined in block Nr.: " + blockNr) )
      .catch((error) => {
        console.error(error)
        reject(error)
      })
  },

  renderSellersPage: function(){
    var self = this;   
    var sellersObj = {}; 
    sellersObj.sellers = [];
    ShopService.getAllSellersIds(Shop.at(shopAddr))
      .then((sellerList) => {
        var s = sellerList.map(addr => SellerService.getSellerContact(Seller.at(addr), addr));
        return Promise.all(s);
      })
      .then(sellerList => {
        for (let index = 0; index < sellerList.length; index++) {
          sellersObj.sellers.push(sellerList[index]);
        }
        App.insertTemplate(sellersObj, SellersTemplate);
      })
  },
  renderAddNewProductPage: function () {
    App.insertTemplate({}, AddProductTemplate);
    var selectTag = document.getElementsByTagName("select")[0];
    ShopService.getAllSellersIds(Shop.at(shopAddr))
      .then((sellerList) => {
        var output = "";
        for (let index = 0; index < sellerList.length; index++) {
          output += '<option>' + sellerList[index] + '</option>';          
        }

        selectTag.innerHTML = output;
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      })
  },

  addNewProduct: function () {

    let sellerAddr = document.getElementById("inputSellerAddr").value;
    console.log("Seller addr" + sellerAddr);
    let album = document.getElementById("inputAlbum").value;
    let artist = document.getElementById("inputArtist").value;
    let ganre = document.getElementById("inputGanre").value;
    let released = document.getElementById("inputReleased").value;
    let duration = document.getElementById("inputDuration").value;
    let quantity = document.getElementById("inputQuantity").value;
    let price = document.getElementById("inputPrice").value;
    console.log("Price:" + price);
    let image = document.getElementById("inputImage");

    let newProduct = {
      "name": album,
      "artist": artist,
      "ganre": ganre,
      "released": released,
      "length": duration,
    };    

    var file = (document.getElementById('inputImage').files[0]);
    var reader = new FileReader();
    var meta;
    reader.addEventListener("load", function () {
      App.saveImageOnIpfs(reader)
        .then((imageIpfsAddr) =>{
          newProduct.cover_image = imageIpfsAddr;
          return App.saveProductOnIpfs(JSON.stringify(newProduct));
        })
        .then((productIpfsAddr) =>{
          console.log("Seller addr: " + sellerAddr);
          return SellerService.addNewProduct(Seller.at(sellerAddr), sellerAddr, productIpfsAddr, quantity, price);
        })
        .then((instance) => {
          debugger;
          console.log("---After add new Prod: " + instance);
        })
        .catch((err) => {
          console.error(err)
          reject(err)
        });
    }, false);

    if (file) {
      reader.readAsArrayBuffer(file);
    }
  },
  saveProductOnIpfs: function (product) {
    return new Promise(function (resolve, reject) {
      const descBuffer = Buffer.from(product, 'utf-8')
      console.log(descBuffer);
      ipfs.add(descBuffer)
        .then((response) => {
          console.log(response)
          resolve(response[0].hash)
        }).catch((err) => {
          console.error(err)
          reject(err)
        })
    })
  },
  saveImageOnIpfs: function (reader) {
    return new Promise(function (resolve, reject) {
      const buffer = Buffer.from(reader.result)
      ipfs.add(buffer)
        .then((response) => {
          console.log(response)
          resolve(response[0].hash)
        }).catch((err) => {
          console.error(err)
          reject(err)
        })
    })
  },

  previewFile: function () {
    var preview = document.querySelector('img');
    var file = document.getElementById('inputImage').files[0];
    var reader = new FileReader();

    reader.addEventListener("load", function () {
      App.saveImageOnIpfs(reader).then(console.log).catch((err) => {
        console.error(err)
        reject(err)
      });
    }, false);

    if (file) {
      reader.readAsArrayBuffer(file);
    }
  }
};

window.addEventListener('load', function () {
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