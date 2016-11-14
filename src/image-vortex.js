const url = require('url');
const request = require('request');
const cheerio = require('cheerio');
const AWS = require('aws-sdk');
const uuid = require('node-uuid');
const sharp = require('sharp');
const fs = require('fs');


class ImageVortex {
    constructor({bucketName}) {
        // Create an S3 client
        this._s3 = new AWS.S3();
        this._bucketName = bucketName;
    }
    
    static saveImageFromURLtoFile(imageURL, destinationFileName) {
        const promise = new Promise((resolve, reject)=> {
            request({
                url: imageURL,
                encoding: null
            }, (err, res, body)=> {
                if (err) {
                    reject(err);
                }
                fs.writeFile(destinationFileName, body, function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({success: true});
                    }
                });
                
            });
        });
        return promise;
        
    }
    
    
    static extractImageURL(pageURL, imageSrc) {
        const srcObj = url.parse(imageSrc);
        if (srcObj.host) {
            return url.format(srcObj);
        }
        const pageObj = url.parse(pageURL);
        
        return url.resolve(pageObj, srcObj);
        
    };
    
    saveImageFromURLToS3(imageURL, destinationFileName, callback) {
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
        });
    }
    
    saveFileToS3(readableStream, destinationFileName) {
        const upload = this._s3.upload({Bucket: this._bucketName, Key: destinationFileName, Body: readableStream});
        const promise = upload.promise();
        return promise;
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
    
    static resizeToWidth(sourcePath, destinationPath, width, format = 'jpg') {
        const promise = new Promise((resolve, reject)=> {
            let img = sharp(sourcePath);
            img.resize(width).toFormat(format).toFile(destinationPath, (error,data)=>{
                if(error){
                    reject(error);
                }else{
                    resolve(data);
                }
            });
        });
        
        return promise;
    }
}

module.exports = ImageVortex;

