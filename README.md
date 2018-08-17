# image-vortex
Simple tool that returns an array of URLs scraped from the src attribute of all the img elements on a given web page.

```
nmp install --save image-vortex
```

    npm run publisher


```
const ImageVortex = require('image-vortex');

// get a list of image srcs from a web page
ImageVortex.getImageURLs('http://www.ninjaPixel.io').then((data)=>{
    console.log(data);
}).catch((err)=>{
    console.log(err);
});

// upload an image to Amazon S3
// note that to do this you need to set the following environmental variables:
// AWS_ACCESS_KEY_ID
// AWS_SECRET_ACCESS_KEY
const ivParams = {bucketName: 'images.glulessapp.com'};
const vortex = new ImageVortex(ivParams);
vortex.saveImageToS3('http://a0.awsstatic.com/main/images/logos/aws_logo.png',  'media/aws_logo.png', function(err, res) {
    if (err)
        throw err;

    console.log('Uploaded data successfully!');
});



```
