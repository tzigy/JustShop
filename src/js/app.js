import "../styles/app.css";
import "../styles/heroic-features.css";
import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import $ from 'jquery';
import ShopService from './services/shop_service.js';
import SellerService from './services/seller_service.js';
import ProductTemplate from './templates/productTemplate.hbs';
import AddProductTemplate from './templates/addProductTemplate.hbs';

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
const shopAddr = "0x345ca3e014aaf5dca488057592ee47305d9b3e10";

var accounts;
var account;

window.App = {
  start: function () {
    var self = this;
    // Bootstrap the MetaCoin abstraction for Use.
    Seller.setProvider(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
    Shop.setProvider(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));

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
      .then(console.log)
      .catch((error) => {
        console.error(error)
        reject(error)
      })
  },

  renderAddNewProductPage: function () {
    App.insertTemplate({}, AddProductTemplate);
  },

  addNewProduct: function () {

    let album = document.getElementById("inputAlbum").value;
    let artist = document.getElementById("inputArtist").value;
    let ganre = document.getElementById("inputGanre").value;
    let released = document.getElementById("inputReleased").value;
    let time = document.getElementById("inputTime").value;
    let image = document.getElementById("inputImage");
    console.log(image);

    let obj = {
      "name": "Test1",
      "artist": "Metallica",
      "ganre": "metal",
      "released": "1988",
      "length": "63:33",
    };
    console.log(obj);
    let jsonObj = JSON.stringify(obj);

    var preview = document.querySelector('img');
    var file = (document.getElementById('inputImage').files[0]);
    var reader = new FileReader();

    reader.addEventListener("load", function () {
      console.log(reader.result);
      //preview.src = reader.result;
      App.saveImageOnIpfs(reader).then(console.log).catch((err) => {
        console.error(err)
        reject(err)
      });
    }, false);

    if (file) {
      reader.readAsArrayBuffer(file);
    }

    // App.saveImageOnIpfs(reader).then(console.log).catch((err) => {
    //   console.error(err)
    //   reject(err)
    // });

  },
  saveTextBlobOnIpfs: function (blob) {
    return new Promise(function (resolve, reject) {
      const descBuffer = Buffer.from(blob, 'utf-8')
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