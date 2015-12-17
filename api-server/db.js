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

exports.addProduct = function (productSite, productId, productTitle, productImage, productPrice, callback) {
    var product = {site: productSite, pid: productId, title: productTitle, image: productImage, price: productPrice};
    con.query('INSERT INTO product SET?', product, function(err,res){
      if (err) {
        console.log('Failed to add product');
        callback(false);
      } else {
        console.log('Product successfully added');
        callback(true);
      }
    });
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
        callback(-1);
      } else {
        var productPrice = res[0].price;
        if (updatedPrice != productPrice) {
          con.query('UPDATE product SET price=' + updatedPrice + ' WHERE site="' + productSite + '" AND pid="' + productId + '"', function(err,res){
            if (err) {
              console.log('Product price could not be updated');
              callback(-1);
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
                callback(-1);
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
    con.query('SELECT site, pid, title, image, price from product WHERE (site,pid) IN (SELECT site, pid FROM userProducts WHERE fbid ="' + facebookid + '")', function(err,res){
      if (err) {
        console.log('Products not found for the user');
        callback(null);
      } else {
        console.log('Retrieved products for the user');
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
