const fs = require("fs");
const BitmapInfoHeader = require("./BitmapInfoHeader")

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



function getOffset(x,y)
{
    let rowSize = Math.ceil(header.width*3/4)*4;
    return pixelDataOffset + rowSize*(header.height - y - 1) + 3*x
}

function rect(x,y,width,height,R=0,G=0,B=0)
{
    for(let X=x; X<x+width; X++)
    {
        for(let Y=y; Y<y+height; Y++)
        {
            let i = getOffset(X,Y);
            buffer.writeUint8(B,i);
            buffer.writeUint8(G,i+1);
            buffer.writeUint8(R,i+2);
        }
    }
}

rect(0,0,800,600,0,0,255);

fs.writeFileSync("image.bmp",buffer)