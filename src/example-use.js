const ImageVortex = require('./image-vortex');
const fs = require('fs');

// get a list of image srcs from a web page
// ImageVortex.getImageURLs('http://www.ninjaPixel.io').then((data)=> {
//     console.log(data);
// }).catch((err)=> {
//     console.log(err);
// });

// upload an image to Amazon S3
// note that to do this you need to set the following environmental variables:
// AWS_ACCESS_KEY_ID
// AWS_SECRET_ACCESS_KEY
// const ivParams = {bucketName: 'images.glulessapp.com'};
// const vortex = new ImageVortex(ivParams);
// vortex.saveImageFromURLToS3('http://a0.awsstatic.com/main/images/logos/aws_logo.png', 'aws_logo.png', (err, res)=> {
//     if (err) {
//         throw err;
//     }
//     console.log('Uploaded data successfully!');
// });

// const imageSrc = 'tiger.jpg';
// const readableStream = fs.createReadStream(imageSrc);
// const writableStream = fs.createWriteStream('./temp/averyuniquename.jpg');

// ImageVortex.resizeImage(readableStream, writableStream);
const chainID = 2;
const ivParams = {bucketName: 'images.glulessapp.com'};
const vortex = new ImageVortex(ivParams);
// const widths = [4000, 3000, 2600, 2048, 1600, 1200, 1000, 800, 600, 400, 200];
const widths = [400, 200];

const shrinkWrap = (imagePath)=> {
    const format = 'jpeg';
    console.log('Execute shrinkwrap');
    ImageVortex.imageDimensions(imagePath).then((meta)=> {
        // console.log('meta', meta);
        const downSizeWidths = widths.filter((d)=> {
            return d <= meta.width
        });
        downSizeWidths.forEach((width)=> {
            console.log(`Resizing ${imagePath} to a width of ${width}px`);
            const fileName = `${width}px.${format}`;
            const path = `temp/${fileName}`;
            
            ImageVortex.resizeToWidth(imagePath, path, width, format).then((data)=> {
                console.log(`Resized ${imagePath} to a width of ${width}px`);
                // upload image to Amazon S3
                vortex.saveFileToS3(fs.createReadStream(path), `chains/${chainID}/${fileName}`).then((data)=> {
                    console.log(`Uploaded ${path} to S3`, data.Location);
                }, (error)=> {
                    console.log(`Error uploading ${path} to S3: ${error}`)
                });
            }).catch((err)=> {
                console.error('Error in resizeToWidth:', err);
            });
        });
    });
    
    
};

const imagePath= 'tiger.jpg';
ImageVortex.saveImageFromURLtoFile('http://www.planwallpaper.com/static/images/desktop-year-of-the-tiger-images-wallpaper.jpg', imagePath).then((success)=> {
    shrinkWrap(imagePath)
}).catch((error)=> {
    console.error('There was an error:', error)
});


