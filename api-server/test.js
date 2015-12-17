var db = require('./db.js');

function test(testvar) {
    console.log('database api works');
    console.log(testvar);
};

//db.establishConnection(test);
//db.registerUser(6467090862,"viralshahrf@gmail.com");
//db.addProduct("Amazon","9773585360","LordOfTheRings","https://i.ytimg.com/vi/0B8C2MkkEqI/maxresdefault.jpg",30, "http://www.amazon.com/Lord-Rings-Fellowship-Extended-Editions/", test);
//db.registerUserProduct(6467090862,"Amazon","9773585360", test);
//db.updateProductPrice("Amazon","9773585360",35, test);
//db.findProductUsers("Amazon","9773585360", test);
//db.findUserDetails(6467090862, test);
//db.disconnect();
//db.findUserProducts(6467090862, test);
//db.doesProductExist("Amazon", "9773585360", test);
//db.unTrackProduct(6467090862, "Amazon", "9773585360", test);
db.findProductUrls(test);
