var mysql = require("mysql");

var con = mysql.createConnection({
    host: "pricetell.ccfbrfce9agt.us-east-1.rds.amazonaws.com",
    port: 3306,
    user: "vrs2119",
    password: "bekanjoos",
    database: "pricetell"
});

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
        callback(false);
      } else {
        console.log('Product has been untracked for the user');
        con.query('DELETE FROM product WHERE (SELECT COUNT(*) FROM userProducts WHERE pid="' + productId + '") = 0 AND pid="' + productId + '"', function(err,res){
          if (err) {
            console.log('Product could not be untracked', err);
            callback(false);
          } else {
            console.log('Product had been untracked from service');
            callback(true);
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

exports.updateProductPrice = function (productSite, productId, updatedPrice){
    con.query('SELECT price FROM product WHERE site="' + productSite + '" AND pid="' + productId + '"', function(err,res){
      if (err) {
        console.log('Product price could not be queried');
      } else {
        var productPrice = res[0].price;
        if (updatedPrice != productPrice) {
          con.query('UPDATE product SET price=' + updatedPrice + ' WHERE site="' + productSite + '" AND pid="' + productId + '"', function(err,res){
            if (err) {
              console.log('Product price could not be updated');
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
              } else {
                console.log('Price history updated');
              }
            });
          }
        });
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
    var query = "SELECT u.site, u.pid, p.url, p.title, p.image as image_url, CONCAT(p.currency, p.price) AS price FROM " +
    "userProducts AS u, product AS p WHERE p.pid = u.pid AND " +
    "u.fbid = '" + facebookid + "' ORDER BY u.created_at DESC";

    con.query(query, function(err,res){
      if (err) {
        console.log(err);
      } else {
        console.log('Retrieved products for the user');
        callback(res);
      }
    });
};

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
  con.query("select p.fbid, u.email, GROUP_CONCAT(p.pid SEPARATOR ',') as trackedProducts from userProducts as p, user as u where u.fbid = p.fbid group by p.fbid", function(err, res) {
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
