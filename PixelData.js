const Context = require("./Context");

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
                this.setPixel(x,y,R,G,B);
            }
        }
        else
        {
            for(let x=Math.min(x1,x2); x<=Math.max(x1,x2); x += 0.1)
            {
                let y = a*x + b;
                for(let t=-lineWidth/2; t<=lineWidth/2; t += 0.1)
                {
                    let offset_x = t * (-a) / Math.sqrt(a*a + 1);
                    let offset_y = t / Math.sqrt(a*a + 1);
                    this.setPixel(x + offset_x, y + offset_y, R, G, B);
                }
            }
            
        }
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

    fillCircle(x,y,radius,R=0,G=0,B=0)
    {
        for(let X=x-radius; X<=x+radius; X++)
        {
            for(let Y=y-radius; Y<=y+radius; Y++)
            {
                if((X-x)*(X-x) + (Y-y)*(Y-y) <= radius*radius)
                {
                    this.setPixel(X,Y,R,G,B);
                }
            }
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

    fillRect(x,y,width,height,R=0,G=0,B=0)
    {
        for(let X=x; X<x+width; X++)
        {
            for(let Y=y; Y<y+height; Y++)
            {
                this.setPixel(X,Y,R,G,B);
            }
        }
    }

}

module.exports = PixelData