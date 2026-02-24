const Color = require("./Color");

function Context(width,height,getPixel,setPixel)
{
    let path = [];
    let x = 0;
    let y = 0;
    let fillColor = new Color();
    let strokeColor = new Color();
    this.lineWidth = 1;
    
    let drawPoint = (x,y,R,G,B,A)=>
    {
        if(this.lineWidth <= 1)
        {
            setPixel(x,y,R,G,B,A)
        }
        else
        {
            let radius = this.lineWidth / 2;

            if(this.antialiasEnabled)
            {
                for(let X=x-radius; X<=x+radius; X++)
                {
                    for(let Y=y-radius; Y<=y+radius; Y++)
                    {
                        let dist = Math.sqrt((X-x)*(X-x) + (Y-y)*(Y-y));
                        let coverage =  1 - (dist - radius);
                        coverage = Math.min(Math.max(coverage, 0), 1);
                        setPixel(X, Y, R, G, B, A*coverage);
                    }
                }
            }
            else
            {
                for(let X=x-radius; X<=x+radius; X++)
                {
                    for(let Y=y-radius; Y<=y+radius; Y++)
                    {
                        if((X-x)*(X-x) + (Y-y)*(Y-y) <= radius*radius)
                        {
                            setPixel(X,Y,R,G,B,A);
                        }
                    }
                }
            }

        }
    }
    
    Object.defineProperty(this,"fillStyle",
    {
        get: function(){return fillColor.toHex()},
        set: function(str){fillColor = new Color(str)}
    })

    Object.defineProperty(this,"strokeStyle",
    {
        get: function(){return strokeColor.toHex()},
        set: function(str){strokeColor = new Color(str)}
    })

    this.antialiasEnabled = true;

    this.beginPath = function()
    {
        path = [];
    }

    this.moveTo = function(x,y)
    {
        path.push(0,x,y);
    }

    this.lineTo = function(x,y)
    {
        path.push(1,x,y);
    }

    this.stroke = function()
    {
        let i=0;
        while(i<path.length)
        {
            switch(path[i])
            {
                case 0: //moveTo
                    x = path[i+1]
                    y = path[i+2]
                    i += 3;
                break;

                case 1: //lineTo
                {
                    let x1 = x;
                    let y1 = y;
                    let x2 = path[i+1];
                    let y2 = path[i+2];
                    let {R,G,B,A} = strokeColor;
                    if(Math.abs(x2-x1)>Math.abs(y2-y1))
                    {
                        if(x1>x2) swap();
                        if(this.antialiasEnabled) f1a(); else f1();
                    }
                    else
                    {
                        if(y1>y2) swap();
                        if(this.antialiasEnabled) f2a(); else f2();
                    }
                    function swap()
                    {  
                        let temp = [x2,y2]
                        x2 = x1
                        y2 = y1
                        x1 = temp[0]
                        y1 = temp[1]
                    }
                    function f1()
                    {               
                        let dx = x2 - x1
                        let dy = y2 - y1 
                        let stepY = 1;
                        if(dy<0)
                        {
                            stepY = -1
                            dy = -dy
                        }
                        for(let X = x1, Y = y1, D = 2*dy - dx; X < x2; X++)
                        {
                            drawPoint(X,Y,R,G,B,A)
                            if(D>0)
                            {
                                Y+=stepY;
                                D -= 2*dx
                            }
                            D += 2*dy
                        }
                    }
                    function f1a()
                    {
                        let dx = x2 - x1;
                        let dy = y2 - y1;
                        let slope = dx==0 ? 1 : dy / dx;
                                            
                        for(let X = x1, Y = y1; X < x2; X++)
                        {
                            let intY = Math.floor(Y);
                            let fracY = Y - intY;
                            drawPoint(X,intY,R,G,B,A* (1-fracY));
                            drawPoint(X,intY+1,R,G,B,A * fracY);
                            Y += slope;
                        }
                        drawPoint(x2,y2,R,G,B,A);
                    }
                    function f2()
                    {
                        let dx = x2 - x1
                        let dy = y2 - y1 
                        let stepX = 1
                        if(dx<0)
                        {
                            stepX = -1
                            dx = -dx
                        }
                        for(let X = x1, Y = y1, D = 2*dx - dy; Y < y2; Y++)
                        {
                            drawPoint(X,Y,R,G,B,A);
                            if(D>0)
                            {
                                X+=stepX;
                                D -= 2*dy;
                            }
                            D += 2*dx;
                        }
                    }
                    function f2a()
                    {
                        let dx = x2 - x1;
                        let dy = y2 - y1;
                        let slope = dy==0? 1 : dx / dy;

                        for(let X = x1, Y = y1; Y < y2; Y++)
                        {
                            let intX = Math.floor(X);
                            let fracX = X - intX;
                            drawPoint(intX,Y,R,G,B,A * (1-fracX));
                            drawPoint(intX+1,Y,R,G,B,A * fracX);
                            X += slope;
                        }
                        drawPoint(x2,y2,R,G,B,A);
                    }
                    x = path[i+1];
                    y = path[i+2];
                }
                i += 3;
                break;

            }
        }
    }

    return this;
}

module.exports = Context