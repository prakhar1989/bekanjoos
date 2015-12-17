var AWS = require('aws-sdk');
var wget = require('wget-improved');
var mkdirp = require('mkdirp');
var fs = require('fs');

exports.storeInS3 = function(image_url, site, product_id, callback) {
    var bucketName = 'bekanjoos-imgs-1';
    var src = image_url;
    var url_paths = src.split("/");

    //var filename = url_paths[url_paths.length - 1];
    //var filename = filename.split(';')[0];
    var filename = site.toLowerCase() + "_" +  product_id;
    var output = 'temp/' + filename;
    var temp_filepath = output;

    mkdirp.sync('temp');

    var s3PublicUrl = '';
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
                    ContentType: 'image/jpg',
                    ACL: 'public-read'
                };
                s3.putObject(data, function(err, data){
                    if (!err) {
                        console.log('succesfully uploaded the image!');
                        s3PublicUrl = 'http://s3.amazonaws.com/' + bucketName + '/' + filename;
                        callback(s3PublicUrl);
                    } else {
                        console.log("file not uploaded due to ", err);
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
}
