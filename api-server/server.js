var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var http = require('http');
var AWS = require('aws-sdk');
var s3Writer = require('./s3.js');


// Connection URL for RDS instance
var url = 'RDS URL';

var port = process.env.PORT || 9000;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});


// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({message: 'hooray! welcome to our api!'});
});


router.route('/products')

    // get all the products assigned to a user (accessed at GET http://localhost:8080/api/:user_id)
    .get(function(req, res) {
   //
  //     res.json({ message: 'Get Request Called' });
  //       MongoClient.connect(url, function (err, db) {
  //         if (err) {
  //           console.log('Unable to connect to the mongoDB server. Error:', err);
  //         }
  //         else{
  //     var cursor = db.collection('users').find( );
  //     cursor.each(function(err, doc) {
  //     //  assert.equal(err, null);
  //       if (doc != null) {
  //        console.log(doc);
  //       } else {
  //        //callback();
  //       }
  //    });
  //  }
  //  });

    })

router.route('/product')
    // add a product for the user (accessed at POST http://localhost:8080/api/:user_id/product)
    .post(function(req, res) {
      var title = req.body.title;
      var url = req.body.url;
      var site = req.body.site;
      var price = req.body.price;
      var product_id = req.body.product_id;
      var image_url = req.body.image_url;
      console.log();
      s3Writer.storeInS3(image_url, function(publicUrl) {
        var s3PublicUrl = publicUrl;
        console.log(s3PublicUrl);

      });
      res.json({message: 'Got a request'});
    })

    // update the product for the user (accessed at POST http://localhost:8080/api/:user_id/product)
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
