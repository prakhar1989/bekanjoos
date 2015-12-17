var mysql = require("mysql");

var con = mysql.createConnection({
    host: "pricetell.ccfbrfce9agt.us-east-1.rds.amazonaws.com",
    port: 3306,
    user: "vrs2119",
    password: "bekanjoos",
    database: "pricetell"
});

//establishConnection();
//registerUser(6467090862,"viralshahrf@gmail.com");
//registerUserProduct(6467090862,"Amazon","9773585360","LordOfTheRings","https://i.ytimg.com/vi/0B8C2MkkEqI/maxresdefault.jpg",30);
//updateProductPrice("Amazon","9773585360",35);
//findProductUsers("Amazon","9773585360");
//findUserDetails(6467090862);
//disconnect();
//findUserProducts(6467090862);

exports.establishConnection =  function (callback){
    con.connect(function(err){
        if (err) {
          console.log('Connection to the database could not be established');
          callback(false);
        } else {
          console.log('Connection established');
          callback(true);
        }
    });
};

exports.registerUser = function(facebookid, emailid) {
    var user = {fbid: facebookid, email: emailid};
    con.query('SELECT fbid FROM user WHERE fbid = ?', facebookid, function(err, result) {
        if (!err) {
          if (result.length != 0)
            console.log('User already exists');
          else {
            con.query('INSERT INTO user SET ?', user, function(err,res){
                if (err) {
                  console.log('User could not be registered');
                } else {
                  console.log('User registered');
                }
            });
          }
        }
        else {
          console.log(err);
        }
    });
};

exports.doesProductExist = function (productSite, productId, callback) {
    con.query('SELECT * FROM product WHERE site="' + productSite + '" AND pid="' + productId + '"', function(err, result) {
      if (err) {
        console.log('Product is not valid');
        callback(false);
      } else {
        if (result[0] != undefined) {
          console.log('Product exists');
          callback(true);
        } else {
          console.log('Product does not exist');
          callback(false);
        }
      }
    })
};

exports.addProduct = function (productSite, productId, productTitle, productImage, productPrice, productCurr, productUrl, callback) {
    var product = {
        site: productSite,
        pid: productId,
        title: productTitle,
        image: productImage,
        price: productPrice,
        currency: productCurr,
        url: productUrl
    };
    con.query('INSERT INTO product SET?', product, function(err,res){
      if (err) {
        console.log('Failed to add product', err);
        callback(false);
      } else {
        console.log('Product successfully added');
        callback(true);
      }
    });
};


exports.unTrackProduct = function (facebookid, productSite, productId, callback) {
    con.query("DELETE FROM userProducts WHERE fbid = " + facebookid + " AND site = '" + productSite + "' AND pid = '" +  productId + "'", function(err, res){
      if (err) {
        console.log('Product could not be untracked', err);
      } else {
        console.log('Product has been untracked for the user');
        con.query('DELETE FROM product WHERE (SELECT COUNT(*) FROM userProducts WHERE pid="' + productId + '") = 0 AND pid="' + productId + '"', function(err,res){
          if (err) {
            console.log('asdasd Product could not be untracked', err);
          } else {
            console.log('Product had been untracked from service');
          }
        })
      }
   })
};


exports.registerUserProduct = function (facebookid, productSite, productId, callback){
    var userProduct = {fbid: facebookid, site: productSite, pid: productId};
    con.query('INSERT INTO userProducts SET?', userProduct, function(err,res){
      if (err) {
        console.log('User is already tracking the product');
        callback('exists');
      } else {
        console.log('Product added for the user');
        callback('added');
      }
    });
};

exports.updateProductPrice = function (productSite, productId, updatedPrice, callback){
    con.query('SELECT price FROM product WHERE site="' + productSite + '" AND pid="' + productId + '"', function(err,res){
      if (err) {
        console.log('Product price could not be queried');
        callback('error', null);
      } else {
        var productPrice = res[0].price;
        if (updatedPrice != productPrice) {
          con.query('UPDATE product SET price=' + updatedPrice + ' WHERE site="' + productSite + '" AND pid="' + productId + '"', function(err,res){
            if (err) {
              console.log('Product price could not be updated');
              callback('error', null);
            } else {
              console.log('Product price has been updated');
            }
          });
        }
        var updateTime = null;
        con.query('SELECT CURRENT_TIMESTAMP', function(err,res){
          if (err) {
            console.log('Current time could not be polled');
          } else {
            updateTime = res[0].CURRENT_TIMESTAMP;
            var priceUpdate = {site: productSite, pid: productId, time: updateTime, price: updatedPrice};
            con.query('INSERT INTO priceHistory SET?', priceUpdate, function(err,res){
              if (err) {
                console.log('Price history failed to update');
                callback('error', null);
              } else {
                console.log('Price history updated');
              }
            });
          }
        });
        callback(updatedPrice - productPrice);
      }
    });
};

exports.findProductUsers = function (productSite, productId, callback){
    con.query('SELECT email FROM user, userProducts WHERE user.fbid = userProducts.fbid AND site="' + productSite + '" AND pid="' + productId + '"', function(err,res){
      if (err) {
        console.log('Retrieval of product users failed');
        callback(null);
      } else {
        console.log('Retrieved product users');
        callback(res);
      }
    });
};

exports.findUserDetails = function (facebookid, callback){
    con.query('SELECT * FROM user WHERE fbid="' + facebookid + '"', function(err,res){
      if (err) {
        console.log('User not registered');
        callback(null);
      } else {
        console.log('Retrieved user details');
        callback(res);
      }
    });
};


exports.findUserProducts = function (facebookid, callback){
    var query = "select u.site, u.pid, p.title, p.image as image_url, CONCAT(p.currency, p.price) as price from " +
    "userProducts as u, product as p where p.pid = u.pid and " +
    "u.fbid = '" + facebookid + "' order by u.created_at desc";

    con.query(query, function(err,res){
      if (err) {
        console.log(err);
      } else {
        console.log('Retrieved products for the user');
        callback(res);
      }
    });
};

 /*
 * select fbid, GROUP_CONCAT(pid SEPARATOR ',') as pids from userProducts where pid in ("MOBECC4UQTJ5QZFR", "401013901692") group by fbid;
 */
exports.findProductUrls = function (callback){
    con.query('select * from product', function(err,res){
      if (err) {
        console.log(err);
      } else {
        console.log('Product urls retrieved');
        callback(res);
      }
    });
};

exports.getUserProducts = function(callback) {
  con.query("select fbid, GROUP_CONCAT(pid SEPARATOR ',') as trackedProducts from userProducts group by fbid", function(err, res) {
    if (err) {
      console.log(err);
    }
    else {
      callback(res);
    }
  });
};

exports.disconnect = function (){
    con.end(function(err){
        if (err ){
          console.log('Connection could not be gracefully terminated');
        } else {
          console.log('Connection gracefully terminated');
        }
    });
};
