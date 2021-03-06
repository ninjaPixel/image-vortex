'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var url = require('url');
var request = require('request');
var cheerio = require('cheerio');
var AWS = require('aws-sdk');
var uuid = require('node-uuid');
var sharp = require('sharp');
var fs = require('fs');

var ImageVortex = function () {
  function ImageVortex(_ref) {
    var bucketName = _ref.bucketName;

    _classCallCheck(this, ImageVortex);

    // Create an S3 client
    this._s3 = new AWS.S3();
    this._bucketName = bucketName;
  }

  _createClass(ImageVortex, [{
    key: 'saveImageFromURLToS3',
    value: function saveImageFromURLToS3(imageURL, destinationFileName, callback) {
      var _this = this;

      request({
        url: imageURL,
        encoding: null
      }, function (err, res, body) {
        if (err) {
          return callback(err, res);
        }

        _this._s3.putObject({
          Bucket: _this._bucketName,
          Key: destinationFileName,
          ContentType: res.headers['content-type'],
          ContentLength: res.headers['content-length'],
          Body: body
        }, callback);
      });
    }
  }, {
    key: 'saveFileToS3',
    value: function saveFileToS3(readableStream, destinationFileName) {
      var upload = this._s3.upload({ Bucket: this._bucketName, Key: destinationFileName, Body: readableStream });
      var promise = upload.promise();
      return promise;
    }
  }], [{
    key: 'saveImageFromURLtoFile',
    value: function saveImageFromURLtoFile(imageURL, destinationFileName) {
      var promise = new Promise(function (resolve, reject) {
        request({
          url: imageURL,
          encoding: null
        }, function (err, res, body) {
          if (err) {
            reject(err);
          }
          fs.writeFile(destinationFileName, body, function (err) {
            if (err) {
              reject(err);
            } else {
              resolve({ success: true });
            }
          });
        });
      });
      return promise;
    }
  }, {
    key: 'extractImageURL',
    value: function extractImageURL(pageURL, imageSrc) {
      var srcObj = url.parse(imageSrc);
      if (srcObj.host) {
        return url.format(srcObj);
      }
      var pageObj = url.parse(pageURL);

      return url.resolve(pageObj, srcObj);
    }
  }, {
    key: 'getImageURLs',
    value: function getImageURLs(pageURL) {
      var extractImageURL = this.extractImageURL;

      var options = {
        url: pageURL,
        headers: {
          'User-Agent': 'request'
        }
      };

      return new Promise(function (resolve, reject) {
        request(options, function (error, response, html) {
          if (!error) {
            var $ = cheerio.load(html);
            var imageURLs = new Set();
            $("img").each(function (i, e) {
              var src = $(e).attr("src");
              if (src && !src.startsWith('data:image')) {
                imageURLs.add(extractImageURL(pageURL, src));
              }
            });
            resolve(Array.from(imageURLs));
          } else {
            reject(error);
          }
        });
      });
    }
  }, {
    key: 'imageDimensions',
    value: function imageDimensions(imagePath) {
      var promise = new Promise(function (resolve, reject) {
        var image;
        try {
          image = sharp(imagePath);
        } catch (er) {
          reject(er);
        }
        return image.metadata().then(function (metadata) {
          resolve(metadata);
        }).catch(function (err) {
          reject(err);
        });
      });
      return promise;
    }
  }, {
    key: 'resizeToWidth',
    value: function resizeToWidth(sourcePath, destinationPath, width) {
      var format = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'jpeg';

      var promise = new Promise(function (resolve, reject) {
        var img = sharp(sourcePath);
        img.resize(width).toFormat(format).toFile(destinationPath, function (error, data) {
          if (error) {
            reject(error);
          } else {
            resolve(data);
          }
        });
      });

      return promise;
    }
  }]);

  return ImageVortex;
}();

module.exports = ImageVortex;