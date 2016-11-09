# image-vortex
Simple tool that returns an array of URLs scraped from the src attribute of all the img elements on a given web page.

```
nmp install --save image-vortex
```


```
const vortex = require('image-vortex');

vortex.getImageURLs('http://www.ninjaPixel.io').then((data)=>{
    console.log(data);
}).catch((err)=>{
    console.log(err);
});
```
