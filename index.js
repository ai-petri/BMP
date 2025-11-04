const fs = require("fs");
const BitmapInfoHeader = require("./BitmapInfoHeader");
const PixelData = require("./PixelData");

let buffer = fs.readFileSync("image.bmp");

let signature = String.fromCharCode(buffer[0],buffer[1]);
console.log(signature) //"BM"

let offset = 2;
let size = buffer.readUint32LE(offset);
offset += 4;

//reserved 4 bytes, must be zero
offset += 4; 

let pixelDataOffset = buffer.readUint32LE(offset);
offset += 4;

//BITMAPINFOHEADER
let header = new BitmapInfoHeader(buffer);

let pixelData = new PixelData(buffer,{offset:pixelDataOffset,width:header.width,height:header.height})


pixelData.fillRect(0,0,200,200,0,125,0);

fs.writeFileSync("image.bmp",buffer)