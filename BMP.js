const BitmapInfoHeader = require("./BitmapInfoHeader");
const PixelData = require("./PixelData");

class BMP
{
    constuctor(buffer)
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
        this.buffer = Buffer.alloc(size);
        this.buffer.write("BM");
        this.buffer.writeUint32LE(size,2);
        this.buffer.writeUint32LE(pixelDataOffset,10);

        this.header = new BitmapInfoHeader(this.buffer);
        this.header.headerSize = 40;
        this.header.width = width;
        this.header.height = height;
        this.header.numberOfColorPlanes = 1;
        this.header.bitsPerPixel = 24;
        this.header.compression = 0;
        this.header.sizeOfBitmapData = 0;
        this.header.horizontalResolution = 0;
        this.header.verticalResolution = 0;
        this.header.numberOfColorsInPalette = 0;
        this.header.numberOfImportantColors = 0;

        this.pixelData = new PixelData(this.buffer,
        {
            offset: pixelDataOffset,
            width,
            height
        });

        return this;
    }

}

module.exports = BMP