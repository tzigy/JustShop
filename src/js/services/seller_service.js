import { default as bs58 } from 'bs58';

var SellerService = {

  // getAllProductsIds: function (sellerInstance) {
  //   return new Promise((resolve, reject) => {
  //     var meta;
  //     sellerInstance.then((instance) => {
  //       meta = instance;
  //       return meta.productsCount.call()
  //     })
  //       .then((count) => {
  //         var arr = [];
  //         for (let index = 0; index < count; index++) {
  //           arr[index] = meta.getBroductByIndex(index);
  //         }
  //         return Promise.all(arr);
  //         //resolve(range(0, Number(sellersCount)))
  //       })
  //       .then((productIds) => {
  //         resolve(productIds);
  //       })
  //       .catch((error) => {
  //         console.error(error)
  //         reject(error)
  //       })
  //   })
  // },
  getSellerByAddr: function (sellerInstance, sellerContrAddr) {
    return new Promise((resolve, reject) => {
      var meta;
      var sellerObj = {};
      // console.log(sellerContrAddr);
      sellerObj.sellerContrAddr = sellerContrAddr.toString('hex');
      console.log(sellerContrAddr.toString(16));
      sellerObj.products = [];
      sellerInstance.then((instance) => {
        meta = instance;
        return meta.name.call();
      }).then((name) => {
        sellerObj.name = web3.toAscii(name);
      }).then(() => {
        return meta.productsCount.call();
      }).then((count) => {
        var arr = [];
        for (let index = 0; index < count; index++) {
          arr[index] = meta.getBroductByIndex(index);
        }
        return Promise.all(arr);
      }).then((products) => {
        var prodList = products.map(product => SellerService.getProdObj(product));
        return Promise.all(prodList);
      }).then(newProdList => {
        for (let index = 0; index < newProdList.length; index++) {
          sellerObj.products.push(newProdList[index]);
        }
        resolve(sellerObj)
      }).catch((error) => {
        console.error(error)
        reject(error)
      })
    })
  },
  getProdObj: function (product) {
    return new Promise((resolve, reject) => {
      var productObj = {};
      var url = "http://localhost:8080/ipfs/" + SellerService.getIpfsHashFromBytes32(product[0]);
      productObj.ipfsAddr = SellerService.getIpfsHashFromBytes32(product[0]).toString();
      productObj.price = product[1].toNumber() / 1000000000000000000;
      productObj.amount = product[2].toNumber();
      SellerService.makeRequest('GET', url)
        .then((ipfsProd) => {
          let prodJson = JSON.parse(ipfsProd);
          //console.log(prodJson);
          productObj.name = prodJson.name;
          productObj.artist = prodJson.artist;
          productObj.ganre = prodJson.ganre;
          productObj.released = prodJson.released;
          productObj.cover_image = "http://localhost:8080/ipfs/" + prodJson.cover_image;

          return resolve(productObj);
        })
    }).catch((error) => {
      console.error(error)
      reject(error)
    })
  },

  getSellerContact: function(sellerInstance, sellerContrAddr){
    return new Promise((resolve, reject) => {
      var meta;
      var sellerObj = {};      
      sellerObj.sellerContrAddr = sellerContrAddr.toString('hex');          
      sellerInstance.then((instance) => {
        meta = instance;
        return meta.getContact();
      }).then((contactData) => {
        
        sellerObj.name = web3.toAscii(contactData[0]);
        sellerObj.addr = web3.toAscii(contactData[1]);
        sellerObj.phone = web3.toAscii(contactData[2]);
      }).then(() => {
        return resolve(sellerObj);
      })
      .catch((error) => {
        console.error(error)
        reject(error)
      })
    })
  },
  makeRequest: function (method, url) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.onload = function () {
        if (this.status >= 200 && this.status < 300) {
          resolve(xhr.response);
        } else {
          reject({
            status: this.status,
            statusText: xhr.statusText
          });
        }
      };
      xhr.onerror = function () {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      };
      xhr.send();
    });
  },
  addNewProduct: function (sellerInstance, sellerAddr, productIpfsAddr, quantity, price) {    
    return new Promise((resolve, reject) => {
      var meta;      
      sellerInstance.then((instance)=>{
        meta = instance;
        let ipfsAddrAsBytes32 = SellerService.getBytes32FromIpfsHash(productIpfsAddr);
        console.log("hello 2: " + ipfsAddrAsBytes32);
        let priceToWei = window.web3.toWei(price, 'ether');        
        return meta.addProduct.sendTransaction(ipfsAddrAsBytes32, priceToWei, quantity, {from: web3.eth.coinbase, to:sellerAddr, gas: 470000 });
        //return resolve();
      })
      .then((answer) => console.log("Added: " + answer));      
    }).catch((error) => {
      console.error("Invalid contract owner! Only the contract owner can add new product.");
      console.error(error)
      reject(error)
    })
  },
  getBytes32FromIpfsHash: function (ipfsAddr) {
    return "0x" + bs58.decode(ipfsAddr).slice(2).toString('hex')
  },
  getIpfsHashFromBytes32: function (bytes32Hex) {
    // Add our default ipfs values for first 2 bytes:
    // function:0x12=sha2, size:0x20=256 bits
    // and cut off leading "0x"
    const hashHex = "1220" + bytes32Hex.slice(2)
    const hashBytes = Buffer.from(hashHex, 'hex');
    const hashStr = bs58.encode(hashBytes)
    return hashStr
  }
};

module.exports = SellerService;