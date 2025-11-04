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

    get rowSize()
    {
        return Math.ceil(this.width*3/4)*4;
    }

    getOffset(x,y)
    { 
        return this.offset + this.rowSize*(this.height - y - 1) + 3*x;
    }

    flipHorizontally()
    {
        for(let i=0; i<this.height; i++)
        {
            let rowOffset = this.offset + i*this.rowSize;
            let row = Buffer.from(this.buffer.subarray(rowOffset, rowOffset + 3*this.width));
            for(let x=0; x<this.width; x++)
            {
                row.copy(this.buffer, rowOffset + 3*x, row.length - 3*(x+1), row.length - 3*x);
            }
        }
    }

    strokeRect(x,y,width,height,R=0,G=0,B=0,lineWidth=1)
    {
        let top = Math.round(y-lineWidth/2);
        let left = Math.round(x-lineWidth/2);
        let W = width + lineWidth;
        let H = height + lineWidth;
        this.fillRect(left, top, W, lineWidth, R, G, B);
        this.fillRect(left + width, top, lineWidth, H, R, G, B);
        this.fillRect(left, top + height, W, lineWidth, R, G, B);
        this.fillRect(left, top, lineWidth, H, R, G, B);
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