const Context = require("./Context");

class PixelData
{
    /**
     * @param {ArrayBuffer} buffer
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

    getPixel(x,y)
    {
        let X = Math.round(x);
        let Y = Math.round(y);
        if(X < 0 || X > this.width - 1 || Y < 0 || Y > this.height - 1) return;

        let offset = this.getOffset(X,Y);
        let B = this.buffer.readUint8(offset);
        let G = this.buffer.readUint8(offset+1);
        let R = this.buffer.readUint8(offset+2);
        return {R,G,B};
    }

    setPixel(x,y,R,G,B,opacity=1)
    {
        let X = Math.round(x);
        let Y = Math.round(y);
        if(X < 0 || X > this.width - 1 || Y < 0 || Y > this.height - 1 || opacity <= 0 || opacity > 1) return;

        let offset = this.getOffset(X,Y);
        if(opacity == 1)
        {
            this.buffer.writeUint8(B,offset);
            this.buffer.writeUint8(G,offset+1);
            this.buffer.writeUint8(R,offset+2);
        }
        else if(opacity > 0 && opacity < 1)
        {
            let prevB = this.buffer.readUint8(offset);
            let prevG = this.buffer.readUint8(offset+1);
            let prevR = this.buffer.readUint8(offset+2);

            let b = Math.round((1-opacity)*prevB + opacity*B);
            let g = Math.round((1-opacity)*prevG + opacity*G);
            let r = Math.round((1-opacity)*prevR + opacity*R);

            this.buffer.writeUint8(b,offset);
            this.buffer.writeUint8(g,offset+1);
            this.buffer.writeUint8(r,offset+2);
        }
    }

    getContext()
    {
        return new Context(this.width,this.height,this.getPixel.bind(this),this.setPixel.bind(this))
    }


}

module.exports = PixelData