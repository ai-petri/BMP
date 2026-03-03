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

    flipHorizontally()
    {
        for(let i=0; i<this.height; i++)
        {
            let rowOffset = this.pixelData.offset + i*this.pixelData.rowSize;
            let row = Buffer.from(this.buffer.subarray(rowOffset, rowOffset + 3*this.width));
            for(let x=0; x<this.pixelData.width; x++)
            {
                row.copy(this.buffer, rowOffset + 3*x, row.length - 3*(x+1), row.length - 3*x);
            }
        }
    }
    flipVertically()
    {
        let clone = Buffer.from(this.buffer);
        for(let i=0; i<this.pixelData.height; i++)
        {
            let rowOffset1 = this.pixelData.offset + i*this.pixelData.rowSize;
            let rowOffset2 = this.pixelData.offset + (this.pixelData.height - i)*this.pixelData.rowSize;
            clone.copy(this.buffer, rowOffset1, rowOffset2);
        }
    }
    fillRect(x,y,width,height,R=0,G=0,B=0)
    {
        for(let X=x; X<x+width; X++)
        {
            for(let Y=y; Y<y+height; Y++)
            {
                this.pixelData.setPixel(X,Y,R,G,B);
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
                this.pixelData.setPixel(x,y,R,G,B);
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
                    this.pixelData.setPixel(x + offset_x, y + offset_y, R, G, B);
                }
            }
            
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
                    this.pixelData.setPixel(X,Y,R,G,B);
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
                        this.pixelData.setPixel(X,Y,R,G,B);
                    }
                }
            }
        }
    }
}

module.exports = BMP