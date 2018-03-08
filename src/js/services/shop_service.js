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
          //resolve(range(0, Number(sellersCount)))
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
};

module.exports = ShopService;