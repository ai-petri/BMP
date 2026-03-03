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

    

    

    
    /**
     * @param {Array<{x:Number,y:Number}>} points 
     * @param {Number} R 
     * @param {Number} G 
     * @param {Number} B 
     * @param {Number} lineWidth 
     */
    strokePath(points,R=0,G=0,B=0,lineWidth=1)
    {
        if(points.length < 2) return;

        for(let i=0; i<points.length - 1; i++)
        {
            if(lineWidth > 1 && i > 0)
            {
                this.fillCircle(points[i].x, points[i].y, lineWidth/2, R, G, B);
            }
            this.strokeLine(points[i].x, points[i].y, points[i+1].x, points[i+1].y, R, G, B, lineWidth);
        }
    }



    fillArc(x,y,radius,startAngle,endAngle,R=0,G=0,B=0)
    {    
        for(let X=x-radius; X<=x+radius; X++)
        {
            for(let Y=y-radius; Y<=y+radius; Y++)
            {
                if((X-x)*(X-x) + (Y-y)*(Y-y) <= radius*radius)
                {
                    let angle = Math.atan2(Y-y, X-x);
                    if(angle < 0)
                    {
                        angle += 2*Math.PI;
                    }
                    
                    if(angle > startAngle && angle < endAngle)
                    {
                        this.setPixel(X,Y,R,G,B);
                    }
                }
            }
        }
    }

    

}

module.exports = PixelData