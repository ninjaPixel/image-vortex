'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var url = require('url');
var request = require('request');
var cheerio = require('cheerio');

var extractImageURL = function extractImageURL(pageURL, imageSrc) {
    var srcObj = url.parse(imageSrc);
    if (srcObj.host) {
        return url.format(srcObj);
    }
    var pageObj = url.parse(pageURL);

    return url.resolve(pageObj, srcObj);
};

var getImageURLs = function getImageURLs(pageURL) {
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
};

exports.getImageURLs = getImageURLs;