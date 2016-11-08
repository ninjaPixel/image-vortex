const vortex = require('./image-vortex.js');

vortex.getImageURLs('http://www.ninjaPixel.io').then((data)=>{
    console.log(data);
}).catch((err)=>{
    console.log(err);
});
