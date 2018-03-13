var ShopService = {

  getAllSellersIds: function (shopInstance) {
    return new Promise((resolve, reject) => {
      var meta;
      shopInstance.then((instance) => {
        meta = instance;
        return meta.sellersCount.call()
      })
        .then((count) => {
          var arr = [];
          for (let index = 0; index < count; index++) {
            arr[index] = meta.getSellerByIndex(index);
          }
          return Promise.all(arr);         
        })
        .then((sellersIds) => {
          resolve(sellersIds);
        })
        .catch((error) => {
          console.error(error)
          reject(error)
        })
    })
  },
  buyProduct: function(shopInstance, sellerAddr, prodId, price) {  
    return new Promise((resolve, reject) => {
      
      window.web3.eth.getAccounts((error, accounts) => {
        shopInstance.then((instance) => {
          let weiToGive = window.web3.toWei(price, 'ether')
          // Buy it for real
          return instance.buyProduct(            
            accounts[0],
            sellerAddr,
            prodId,            
            {from: accounts[0], value:weiToGive, gas: 4476768} // TODO (SRJ): is gas needed?
          )
        })
        .then((transactionReceipt) => {
          // Success
          resolve(transactionReceipt)
        })
        .catch((error) => {
          console.error(error)
          reject(error)
        })
      })
    })
  },

  waitTransactionFinished: function(transactionReceipt, pollIntervalMilliseconds=1000) {
    return new Promise((resolve, reject) => {
      let txCheckTimer = setInterval(txCheckTimerCallback, pollIntervalMilliseconds);
      function txCheckTimerCallback() {
        window.web3.eth.getTransaction(transactionReceipt, (error, transaction) => {
          if (transaction.blockNumber != null) {
            // console.log(`Transaction mined at block ${transaction.blockNumber}`)
            // console.log(transaction)
            

            clearInterval(txCheckTimer)
            // Hack to wait two seconds, as results don't seem to be
            // immediately available.
            setTimeout(()=>resolve(transaction.blockNumber), 2000)
          }
        })
      }
    })
  }



  // buyProduct: function(shopInstance, sellerAddr, prodId, price){
  //   return new Promise((resolve, reject) => {
  //     var meta;
  //     shopInstance.then((instance) => {
  //       meta = instance;
  //       let weiToGive = window.web3.toWei(price, 'ether')
  //       return meta.buyProduct(sellerAddr,{from: web3.eth.coinbase, value: weiToGive, gas: 21000000})
  //     })
  //       .then((transactionReceipt) => {
  //         resolve(transactionReceipt);      
  //       })       
  //       .catch((error) => {
  //         console.error(error)
  //         reject(error)
  //       })
  //   })
  // }
};

module.exports = ShopService;