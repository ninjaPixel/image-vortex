const url = require('url');
const request = require('request');
const cheerio = require('cheerio');
const AWS = require('aws-sdk');
const uuid = require('node-uuid');
var sharp = require('sharp');


class ImageVortex {
    constructor({bucketName}) {
        // Create an S3 client
        this._s3 = new AWS.S3();
        this._bucketName = bucketName;
    }
    
    static extractImageURL(pageURL, imageSrc) {
        const srcObj = url.parse(imageSrc);
        if (srcObj.host) {
            return url.format(srcObj);
        }
        const pageObj = url.parse(pageURL);
        
        return url.resolve(pageObj, srcObj);
        
    };
    
    saveImageToS3(imageURL, destinationFileName, callback) {
        request({
            url: imageURL,
            encoding: null
        }, (err, res, body)=> {
            if (err) {
                return callback(err, res);
            }
            
            this._s3.putObject({
                Bucket: this._bucketName,
                Key: destinationFileName,
                ContentType: res.headers['content-type'],
                ContentLength: res.headers['content-length'],
                Body: body
            }, callback);
        })
    }
    
    static getImageURLs(pageURL) {
        const extractImageURL = this.extractImageURL;
        
        return new Promise((resolve, reject)=> {
            request(pageURL, function (error, response, html) {
                if (!error) {
                    const $ = cheerio.load(html);
                    const imageURLs = new Set();
                    $("img").each((i, e) => {
                        const src = $(e).attr("src");
                        imageURLs.add(extractImageURL(pageURL, src));
                    });
                    resolve(imageURLs.values());
                } else {
                    reject(error);
                }
            });
        });
    }
    
    
    static imageDimensions(imagePath) {
        var image = sharp(imagePath);
         return image.metadata()
          .then(function (metadata) {
              return metadata;
          });
        
    }
    
    static resizeImage(readableStream, writableStream) {
        var transformer = sharp()
          .resize(300)
          .on('info', function (info) {
              console.log('Image height is ' + info.height);
          });
        readableStream.pipe(transformer).pipe(writableStream);
    }
}

module.exports = ImageVortex;

