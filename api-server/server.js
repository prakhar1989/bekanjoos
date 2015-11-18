// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express');
var app = express();

var port = process.env.PORT || 8080;        // set our port

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
    res.json({ message: 'hooray! welcome to our api!' });
});


router.route('/:user_id')

    // get all the products assigned to a user (accessed at GET http://localhost:8080/api/:user_id)
    .get(function(req, res) {

      res.json({ message: 'Get Request Called' });

    });



router.route('/:user_id/product')

        // add a product for the user (accessed at POST http://localhost:8080/api/:user_id/product)
        .post(function(req, res) {

          res.json({ message: 'Post Request Called' });

        })

        // update the product for the user (accessed at POST http://localhost:8080/api/:user_id/product)
        .put(function(req, res) {

          res.json({ message: 'Put Request Called' });

        });



// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
