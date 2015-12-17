var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var http = require('http');
var AWS = require('aws-sdk');
var s3Writer = require('./s3.js');
var db = require('./db.js');

var port = process.env.PORT || 9000;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    next(); // make sure we go to the next routes and don't stop here
});


// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({message: 'hooray! welcome to our api!'});
});


router.route('user/:fbid/products')
  // get all the products assigned to a user (accessed at GET http://localhost:8080/api/:user_id)
  .get(function(req, res) {
    //var
  })

// add a new user with FB ID, or check existing user
router.route('/login')
  .post(function(req, res) {
      var fbid = req.body.fbid;
      var email = req.body.email;
      db.registerUser(fbid, email);
      // take some better action
      res.send();
  })

router.route('/user/:fbid/product')
    // when a user wants to track a new product
    .post(function(req, res) {
      var fbid = req.params.fbid;
      var title = req.body.title;
      var url = req.body.url;
      var site = req.body.site;
      var price = parseInt(req.body.price);
      var product_id = req.body.product_id;
      db.doesProductExist(site, product_id, function(productExists) {
        if (!productExists) {
          var image_url = req.body.image_url;
          s3Writer.storeInS3(image_url, function(s3publicUrl) {
            db.addProduct(site, product_id, title, s3publicUrl, price, function(productAdded) {
              if (productAdded) {
                db.registerUserProduct(fbid, site, product_id, function(dbResponse) {
                  if (dbResponse == 'exists')
                    // can set status numbers to condition on based on client side requirements
                    res.json({message: "You're already tracking this product"});
                  if (dbResponse == 'added')
                    res.json({message: "You are now tracking this product"});
                });
              }
            });
          });
        }
        else {
          db.registerUserProduct(fbid, site, product_id, function(dbResponse) {
            if (dbResponse == 'exists')
              // can set status numbers to condition on based on client side requirements
              res.json({message: "You're already tracking this product"});
            if (dbResponse == 'added')
              res.json({message: "You are now tracking this product"});
          });
        }
      });
    })

    // user wants to delete a product from his list
    .delete(function(req, res) {
      res.json({ status: 'product added', id: 10 });

    });

router.route('/newprice')
  .post(function(req, res) {

  })





// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Listening on 9000');
