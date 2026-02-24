const BitmapInfoHeader = require("./BitmapInfoHeader");
const PixelData = require("./PixelData");

class BMP
{
    constructor(buffer)
    {
        let signature = String.fromCharCode(buffer[0],buffer[1]);
        if(signature !== "BM") return;
        let size = buffer.readUint32LE(2);
        if(size !== buffer.length) return;
        let pixelDataOffset = buffer.readUint32LE(10)
        this.buffer = buffer;
        this.header = new BitmapInfoHeader(buffer);
        this.pixelData = new PixelData(buffer, 
        {
            offset: pixelDataOffset,
            width: this.header.width,
            height: this.header.height
        });          
    }

    static create(width,height)
    {
        let pixelDataOffset = 54;
        let size = pixelDataOffset + height * Math.ceil(width*3/4)*4;
        let buffer = Buffer.alloc(size);
        buffer.write("BM");
        buffer.writeUint32LE(size,2);
        buffer.writeUint32LE(pixelDataOffset,10);

        let header = new BitmapInfoHeader(buffer);
        header.headerSize = 40;
        header.width = width;
        header.height = height;
        header.numberOfColorPlanes = 1;
        header.bitsPerPixel = 24;
        header.compression = 0;
        header.sizeOfBitmapData = 0;
        header.horizontalResolution = 0;
        header.verticalResolution = 0;
        header.numberOfColorsInPalette = 0;
        header.numberOfImportantColors = 0;

        return new BMP(buffer);
    }

    getContext()
    {
        return this.pixelData.getContext();
    }

}

module.exports = BMP