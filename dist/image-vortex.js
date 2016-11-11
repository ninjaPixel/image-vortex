'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var url = require('url');
var request = require('request');
var cheerio = require('cheerio');
var AWS = require('aws-sdk');
var uuid = require('node-uuid');
var sharp = require('sharp');

var ImageVortex = function () {
    function ImageVortex(_ref) {
        var bucketName = _ref.bucketName;

        _classCallCheck(this, ImageVortex);

        // Create an S3 client
        this._s3 = new AWS.S3();
        this._bucketName = bucketName;
    }

    _createClass(ImageVortex, [{
        key: 'saveImageToS3',
        value: function saveImageToS3(imageURL, destinationFileName, callback) {
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
    }], [{
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

            return new Promise(function (resolve, reject) {
                request(pageURL, function (error, response, html) {
                    if (!error) {
                        (function () {
                            var $ = cheerio.load(html);
                            var imageURLs = new Set();
                            $("img").each(function (i, e) {
                                var src = $(e).attr("src");
                                imageURLs.add(extractImageURL(pageURL, src));
                            });
                            resolve(imageURLs.values());
                        })();
                    } else {
                        reject(error);
                    }
                });
            });
        }
    }, {
        key: 'imageDimensions',
        value: function imageDimensions(imagePath) {
            var image = sharp(imagePath);
            return image.metadata().then(function (metadata) {
                return metadata;
            });
        }
    }, {
        key: 'resizeImage',
        value: function resizeImage(readableStream, writableStream) {
            var transformer = sharp().resize(300).on('info', function (info) {
                console.log('Image height is ' + info.height);
            });
            readableStream.pipe(transformer).pipe(writableStream);
        }
    }]);

    return ImageVortex;
}();

module.exports = ImageVortex;