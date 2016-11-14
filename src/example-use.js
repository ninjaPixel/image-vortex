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
    const shrinkWrappedPromise = new Promise((resolve, reject)=> {
        const format = 'jpeg';
        ImageVortex.imageDimensions(imagePath).then((meta)=> {
            
            const downSizeWidths = widths.filter((d)=> {
                return d <= meta.width
            });
            
            const promises =downSizeWidths.map((width)=> {
                // console.log(`Resizing ${imagePath} to a width of ${width}px`);
                const fileName = `${width}px.${format}`;
                const path = `temp/${fileName}`;
                
                return new Promise((resolve, reject)=> {
                    ImageVortex.resizeToWidth(imagePath, path, width, format).then((data)=> {
                        // console.log(`Resized ${imagePath} to a width of ${width}px`);
                        // upload image to Amazon S3
                        vortex.saveFileToS3(fs.createReadStream(path), `chains/${chainID}/${fileName}`).then((data)=> {
                            // console.log(`Uploaded ${path} to S3`, data.Location);
                            resolve(data.Location);
                        }, (error)=> {
                            console.error(`Error uploading ${path} to S3: ${error}`);
                            reject(error);
                            
                        });
                    }).catch((err)=> {
                        console.error('Error in resizeToWidth:', err);
                        reject(err);
                    });
                });
            });
            resolve(promises);
        });
    });
    
    return shrinkWrappedPromise;
};


const imagePath = 'tiger.jpg';
ImageVortex.saveImageFromURLtoFile('http://www.planwallpaper.com/static/images/desktop-year-of-the-tiger-images-wallpaper.jpg', imagePath).then((success)=> {
    const shrinkFunctions = shrinkWrap(imagePath).then((data)=> {
        Promise.all(data).then((values)=>{
            console.log('All images uploaded. URLs:',values)
        }).catch((err)=>{
            console.error('Error uploading images:', err);
        });
        
    });
}).catch((error)=> {
    console.error('There was an error:', error)
});


