const ImageVortex = require('./image-vortex');

// get a list of image srcs from a web page
// ImageVortex.getImageURLs('http://www.ninjaPixel.io').then((data)=>{
//     console.log(data);
// }).catch((err)=>{
//     console.log(err);
// });

// upload an image to Amazon S3
// note that to do this you need to set the following environmental variables:
// AWS_ACCESS_KEY_ID
// AWS_SECRET_ACCESS_KEY
const ivParams = {bucketName: 'images.glulessapp.com'};
const vortex = new ImageVortex(ivParams);
vortex.saveImageToS3('','chains/hello.txt');


