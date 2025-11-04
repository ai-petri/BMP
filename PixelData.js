class PixelData
{
    /**
     * @param {NonSharedBuffer} buffer
     * @param {{offset:Number,width:Number,height:Number}} options 
     */
    constructor(buffer, options)
    {
        this.buffer = buffer;
        this.offset = options.offset;
        this.width = options.width;
        this.height = options.height;
    }

    getOffset(x,y)
    {
        let rowSize = Math.ceil(this.width*3/4)*4;
        return this.offset + rowSize*(this.height - y - 1) + 3*x;
    }

    fillRect(x,y,width,height,R=0,G=0,B=0)
    {
        for(let X=x; X<x+width; X++)
        {
            for(let Y=y; Y<y+height; Y++)
            {
                let i = this.getOffset(X,Y);
                this.buffer.writeUint8(B,i);
                this.buffer.writeUint8(G,i+1);
                this.buffer.writeUint8(R,i+2);
            }
        }
    }

}

module.exports = PixelData