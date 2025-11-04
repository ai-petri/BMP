class BitmapInfoHeader
{
    /** 
     * @param {NonSharedBuffer} buffer 
     */
    constructor(buffer)
    {
        this.buffer = buffer;
    }

    get headerSize() {return this.buffer.readUint32LE(14);}
    get width() {return this.buffer.readUint32LE(18);}
    get height() {return this.buffer.readUint32LE(22);}
    get numberOfColorPlanes() {return this.buffer.readUint16LE(26);}
    get bitsPerPixel() {return this.buffer.readUint16LE(28);}
    get compression() {return this.buffer.readUint32LE(30);}
    get sizeOfBitmapData() {return this.buffer.readUint32LE(34);}
    get horizontalResolution() {return this.buffer.readUint32LE(38);} //pixels per meter
    get verticalResolution() {return this.buffer.readUint32LE(42);} //pixels per meter
    get numberOfColorsInPalette() {return this.buffer.readUint32LE(46);}
    get numberOfImportantColors() {return this.buffer.readUint32LE(50);}

    set headerSize(value)  {this.buffer.writeUint32LE(value,14);}
    set width(value)  {this.buffer.writeUint32LE(value,18);}
    set height(value)  {this.buffer.writeUint32LE(value,22);}
    set numberOfColorPlanes(value)  {this.buffer.writeUint16LE(value,26);}
    set bitsPerPixel(value)  {this.buffer.writeUint16LE(value,28);}
    set compression(value)  {this.buffer.writeUint32LE(value,30);}
    set sizeOfBitmapData(value)  {this.buffer.writeUint32LE(value,34);}
    set horizontalResolution(value)  {this.buffer.writeUint32LE(value,38);}
    set verticalResolution(value)  {this.buffer.writeUint32LE(value,42);}
    set numberOfColorsInPalette(value)  {this.buffer.writeUint32LE(value,46);}
    set numberOfImportantColors(value)  {this.buffer.writeUint32LE(value,50);}
    
    getAll()
    {
        return {
            headerSize: this.headerSize,
            width: this.width,
            height: this.height,
            numberOfColorPlanes: this.numberOfColorPlanes,
            bitsPerPixel: this.bitsPerPixel,
            compression: this.compression,
            sizeOfBitmapData: this.sizeOfBitmapData,
            horizontalResolution: this.horizontalResolution,
            verticalResolution: this.verticalResolution,
            numberOfColorPlanes: this.numberOfColorPlanes,
            numberOfColorsInPalette: this.numberOfColorsInPalette,
            numberOfImportantColors: this.numberOfImportantColors
        }
    }
}

module.exports = BitmapInfoHeader