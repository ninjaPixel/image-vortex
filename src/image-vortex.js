const url = require('url');
const request = require('request');
const cheerio = require('cheerio');
const AWS = require('aws-sdk');
const uuid = require('node-uuid');


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
    
    
    test(sourceURL, destinationFileName) {
        this._s3.createBucket({Bucket: this._bucketName}, ()=> {
            const params = {Bucket: this._bucketName, Key: destinationFileName, Body: 'Hello World!'};
            console.log('params', params);
            this._s3.putObject(params, (err, data)=> {
                
                if (err) {
                    throw err;
                    
                }
                
                console.log("Successfully uploaded data to " + this._bucketName + "/" + destinationFileName);
            });
        });
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
    };
    
}

module.exports = ImageVortex;

