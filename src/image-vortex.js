const url = require('url');
const request = require('request');
const cheerio = require('cheerio');


const extractImageURL = (pageURL, imageSrc)=> {
    const srcObj = url.parse(imageSrc);
    if (srcObj.host) {
        return url.format(srcObj);
    }
    const pageObj = url.parse(pageURL);
    
    return url.resolve(pageObj, srcObj);
    
};

const getImageURLs = (pageURL)=> {
    return new Promise((resolve, reject)=> {
        request(pageURL, function (error, response, html) {
            if (!error) {
                const $ = cheerio.load(html);
                const imageURLs = new Set();
                $("img").each(function (i, e) {
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

export {getImageURLs};

