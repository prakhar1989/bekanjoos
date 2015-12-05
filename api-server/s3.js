var AWS = require('aws-sdk');
var wget = require('wget-improved');
var fs = require('fs');


var bucketName = 'bekanjoos-imgs';
var src = 'http://img6a.flixcart.com/image/sunglass/r/s/b/fa-1102-c1-farenheit-m-400x400-imae37gyr5q8fpwg.jpeg';
//var output = 'temp/'
var url_paths = src.split("/");
var filename = url_paths[url_paths.length - 1];
var ext = filename.split(".")[1];
var output = 'temp/' + filename;
var temp_filepath = output;
var download = wget.download(src, output, {});
download.on('error', function(err) {
    console.log(err);
});

download.on('end', function (output) {
  fs.readFile(temp_filepath, function(err, data) {
    if (err) {
      console.log(err);
    }
    else {
      var s3 = new AWS.S3({params : {Bucket: bucketName}});
      var data = {
        Key: filename,
        Body: data,
        ContentType: 'image/'+ext,
        ACL: 'public-read'
      };
      s3.putObject(data, function(err, data){
          if (!err) {
            console.log('succesfully uploaded the image!');
            var publicUrl = 'https://s3.amazonaws.com/' + bucketName + '/' + filename;
            console.log(publicUrl);
          }
      });
    }
  });
  // deleting the temp file from system
  fs.unlink(temp_filepath, function(err) {
    if (!err) {
      console.log('Temp image deleted');
    }
  });
});
