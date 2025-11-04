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
        let X = Math.round(x);
        let Y = Math.round(y);
        return this.offset + this.rowSize*(this.height - Y - 1) + 3*X;
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

    flipVertically()
    {
        let clone = Buffer.from(this.buffer);
        for(let i=0; i<this.height; i++)
        {
            let rowOffset1 = this.offset + i*this.rowSize;
            let rowOffset2 = this.offset + (this.height - i)*this.rowSize;
            clone.copy(this.buffer, rowOffset1, rowOffset2);
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

    strokeLine(x1,y1,x2,y2,R=0,G=0,B=0,lineWidth=1)
    {
        if(x1 == x2)
        {
            this.fillRect(x1,y1,lineWidth,Math.abs(y2-y1));
            return;
        }

        let a = (y2 - y1) / (x2 - x1);
        let b = y1 - a*x1;

        if(lineWidth == 1)
        {
            for(let x=Math.min(x1,x2); x<=Math.max(x1,x2); x++)
            {
                let y = Math.round(a*x + b);
                let offset = this.getOffset(x,y);
                this.buffer.writeUint8(B,offset);
                this.buffer.writeUint8(G,offset+1);
                this.buffer.writeUint8(R,offset+2);
            }
        }
        else
        {
            for(let x=Math.min(x1,x2); x<=Math.max(x1,x2); x++)
            {
                let y = a*x + b;
                for(let t=-lineWidth/2; t<=lineWidth/2; t += 0.01)
                {
                    let offset_x = t * (-a) / Math.sqrt(a*a + 1);
                    let offset_y = t / Math.sqrt(a*a + 1);
                    let offset = this.getOffset(x + offset_x, y + offset_y);
                    this.buffer.writeUint8(B,offset);
                    this.buffer.writeUint8(G,offset+1);
                    this.buffer.writeUint8(R,offset+2);
                }
            }
            
        }
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