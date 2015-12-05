// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express');
var app = express();
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
//var db;


// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/pricetell';

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router



// Use connect method to connect to the Server
  /*MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      //HURRAY!! We are connected. :)
      console.log('Connection established to', url);
      //this.db = db;

      // do some work here with the database.

      //Close connection
      //db.close();
  }

});*/

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});


// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});


router.route('/products')

    // get all the products assigned to a user (accessed at GET http://localhost:8080/api/:user_id)
    .get(function(req, res) {

      res.json({ message: 'Get Request Called' });
        MongoClient.connect(url, function (err, db) {
          if (err) {
            console.log('Unable to connect to the mongoDB server. Error:', err);
          }
          else{
      var cursor = db.collection('users').find( );
      cursor.each(function(err, doc) {
      //  assert.equal(err, null);
        if (doc != null) {
         console.log(doc);
        } else {
         //callback();
        }
     });
   }
   });

    })

router.route('/product')
    // add a product for the user (accessed at POST http://localhost:8080/api/:user_id/product)
    .post(function(req, res) {

      res.json({ message: 'Post Request Called' });

    })

    // update the product for the user (accessed at POST http://localhost:8080/api/:user_id/product)
    .delete(function(req, res) {

      res.json({ message: 'Delete Request Called' });

    });





// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
