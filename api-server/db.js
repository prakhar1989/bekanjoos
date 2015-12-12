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

exports.establishConnection =  function (){
    con.connect(function(err){
        if (err) {
          console.log('Connection to the database could not be established');
        } else {
          console.log('Connection established');
        }
    });
};

exports.registerUser = function(facebookid, emailid){
    var user = {fbid: facebookid, email: emailid};
    con.query('INSERT INTO user SET ?', user, function(err,res){
        if (err) {
          console.log('User could not be registered');
        } else {
          console.log('User registered');
        }
    });
};

exports.registerUserProduct = function (facebookid, productSite, productId, productTitle, productImage, productPrice){
    var product = {site: productSite, pid: productId ,title: productTitle, image: productImage, price: productPrice};
    con.query('INSERT INTO product SET?', product, function(err,res){
      if (err) {
        console.log(err);
        console.log('Product has already been added');
      } else {
        console.log('Product has been successfully added');
      }
    });
    var userProduct = {fbid: facebookid, site: productSite, pid: productId};
    con.query('INSERT INTO userProducts SET?', userProduct, function(err,res){
      if (err) {
         console.log('Product has already been added by user');
      } else {
        console.log('Product has been successfully added for the user');
      }
    });
};

function updateProductPrice(productSite, productId, updatedPrice){
    con.query('SELECT price FROM product WHERE site="' + productSite + '" AND pid="' + productId + '"', function(err,res){
      if (err) {
        console.log('Product price could not be queried');
        return 0;
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
            console.log('Current time unavailable');
          } else {
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
        return productPrice - updatedPrice;
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
