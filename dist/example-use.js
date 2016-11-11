'use strict';

var ImageVortex = require('./image-vortex');

// get a list of image srcs from a web page
ImageVortex.getImageURLs('http://www.ninjaPixel.io').then(function (data) {
    console.log(data);
}).catch(function (err) {
    console.log(err);
});

// upload an image to Amazon S3
// note that to do this you need to set the following environmental variables:
// AWS_ACCESS_KEY_ID
// AWS_SECRET_ACCESS_KEY
var ivParams = { bucketName: 'images.glulessapp.com' };
var vortex = new ImageVortex(ivParams);
vortex.saveImageToS3('http://a0.awsstatic.com/main/images/logos/aws_logo.png', 'aws_logo.png', function (err, res) {
    if (err) {
        throw err;
    }
    console.log('Uploaded data successfully!');
});