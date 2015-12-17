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

// functions we need to service
// get all products that a user is tracking
//

// not needed, everything works without it also
exports.establishConnection =  function (){
    con.connect(function(err){
        if (err) {
          console.log('Connection to the database could not be established');
        } else {
          console.log('Connection established');
        }
    });
};

exports.registerUser = function(facebookid, emailid) {
    var user = {fbid: facebookid, email: emailid};
    // check if user already exists, may need to take some action in this case.
    con.query('SELECT fbid FROM user WHERE fbid = ?', facebookid, function(err, result) {
        if (!err) {
          if (result.length != 0)
            console.log('User already exists');
          else {
            con.query('INSERT INTO user SET ?', user, function(err,res){
                if (err) {
                  // put some better error logging
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
    if (!err) {
      if (result[0] !== undefined) {
        callback(true);
      } else
        callback(false);
    }
    else {
      console.log(err);
    }
  })
};

exports.addProduct = function (productSite, productId, productTitle, productImage, productPrice, callback) {
  var product = {site: productSite, pid: productId, title: productTitle, image: productImage, price: productPrice};
  con.query('INSERT INTO product SET?', product, function(err,res){
    if (!err) {
      callback(true);
    }
    else
      callback(false);
  });
};

exports.registerUserProduct = function (facebookid, productSite, productId, callback){
    var userProduct = {fbid: facebookid, site: productSite, pid: productId};
    con.query('INSERT INTO userProducts SET?', userProduct, function(err,res){
      if (err) {
         // user already tracking the product
         callback('exists');
      } else {
        // new product added for user
        callback('added');
      }
    });
};

exports.unTrackProduct = function (facebookid, productSite, productId, callback) {
  con.query("DELETE FROM userProducts WHERE fbid = " + facebookid + " AND site = '" + productSite + "' AND pid = " +  productId, function(err, res) {
    if (!err) {
      callback(true);
    }
    else {
      console.log(err);
      callback(false);
    }
  })
};

// exports.getCurrentPrice = function(productSite, productId, callback) {
//   con.query('SELECT price FROM product WHERE site="' + productSite + '" AND pid="' + productId + '"', function(err,res) {
//     if (!err) {
//       callback(res[0].price);
//     }
//     else {
//       console.log(err);
//     }
//   });
// };

exports updateProductPrice = function (productSite, productId, updatedPrice){
    con.query('SELECT price FROM product WHERE site="' + productSite + '" AND pid="' + productId + '"', function(err,res){
      if (!err) {
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
          if (!err) {
            updateTime = res[0].CURRENT_TIMESTAMP;
            var priceUpdate = {site: productSite, pid: productId, time: updateTime, price: updatedPrice};
            con.query('INSERT INTO priceHistory SET?', priceUpdate, function(err,res){
              if (err) {
                console.log(err);
                console.log('Price history failed to update');
              } else {
                console.log('Price history updated');
              }
            });
          }
        });
        return updatedPrice - productPrice;
      }
    });
};

function findProductUsers(productSite, productId){
    con.query('SELECT email FROM user, userProducts WHERE user.fbid = userProducts.fbid AND site="' + productSite + '" AND pid="' + productId + '"', function(err,res){
      if (err) {
        console.log('Retrieval of product users failed');
        return null;
      } else {
        console.log('Retrieved product users');
        console.log(res);
        return res;
      }
    });
};

function findUserDetails(facebookid){
    con.query('SELECT * FROM user WHERE fbid="' + facebookid + '"', function(err,res){
      if (err) {
        console.log('User not registered');
        return null;
      } else {
        console.log('Retrieved user details');
        console.log(res);
        return res;
      }
    });
};



function disconnect(){
    con.end(function(err){
        if (err ){
          console.log('Connection could not be gracefully terminated');
        } else {
          console.log('Connection gracefully terminated');
        }
    });
};
