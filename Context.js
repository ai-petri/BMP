const Color = require("./Color");

function Context(width,height,getPixel,setPixel)
{
    let path = [];
    let x = 0;
    let y = 0;
    let fillColor = new Color();
    let strokeColor = new Color();
    this.lineWidth = 1;
    let pixelCoverages = {};
    let render = _=>
    {
        let {R,G,B,A} = strokeColor;
        for(let coords in pixelCoverages)
        {
            let [x,y] = coords.split("-").map(Number);
            let coverage = pixelCoverages[coords];
            if(coverage>0)
            {
                setPixel(x,y,R,G,B,A*coverage);
            }
        }
        pixelCoverages = {};
    }
    let drawPoint = (x,y,coverage)=>
    {
        if(this.lineWidth <= 1)
        {
            pixelCoverages[`${x}-${y}`] = coverage;
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
                        let t = Math.min(radius/5, 1);
                        let linear = Math.max(0, 1 - dist/radius);
                        let gaussian = Math.exp(-(dist*dist) / (2 * (radius/2)*(radius/2)));
                        coverage = (1-t)*linear + t*gaussian;


                        if(pixelCoverages[`${X}-${Y}`])
                        {
                            pixelCoverages[`${X}-${Y}`] = Math.max(coverage, pixelCoverages[`${X}-${Y}`])
                        }
                        else
                        {
                            pixelCoverages[`${X}-${Y}`] = coverage;
                        }
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
                            pixelCoverages[`${X}-${Y}`] = 1;
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

    this.arc = function(cx, cy, radius, startAngle, endAngle, counterclockwise=false)
    {
        path.push(2, cx, cy, radius, startAngle, endAngle, counterclockwise);
    }

    this.arcTo = function(x1, y1, x2, y2, radius)
    {
        path.push(3, x1, y1, x2, y2, radius);
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
                            drawPoint(X,Y,1)
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
                            drawPoint(X,intY,(1-fracY));
                            drawPoint(X,intY+1,fracY);
                            Y += slope;
                        }
                        drawPoint(x2,y2,1);
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
                            drawPoint(X,Y,1);
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
                            drawPoint(intX,Y,(1-fracX));
                            drawPoint(intX+1,Y,fracX);
                            X += slope;
                        }
                        drawPoint(x2,y2);
                    }
                    x = path[i+1];
                    y = path[i+2];

                    render();
                }
                i += 3;
                break;

                case 2: //arc
                {
                    let cx = path[i+1];
                    let cy = path[i+2];
                    let radius = path[i+3];
                    let startAngle = path[i+4];
                    let endAngle = path[i+5];
                    let counterclockwise = path[i+6];
                    
                    if(counterclockwise)
                    {
                        if(startAngle<endAngle) 
                            startAngle += 2*Math.PI;

                        for(let angle=startAngle; angle>=endAngle; angle-=0.01) 
                            plot(angle);
                    }
                    else
                    {
                        if(startAngle>endAngle) 
                            startAngle -= 2*Math.PI;

                        for(let angle=startAngle; angle<=endAngle; angle+=0.01) 
                            plot(angle);
                    }

                    function plot(angle)
                    {
                        let x = cx + radius*Math.cos(angle);
                        let y = cy + radius*Math.sin(angle);
                        xi = Math.floor(x);
                        yi = Math.floor(y);
                        fracX = x - xi;
                        fracY = y - yi;

                        drawPoint(xi, yi, (1-fracX)*(1-fracY));
                        drawPoint(xi+1, yi, fracX*(1-fracY));
                        drawPoint(xi, yi+1, (1-fracX)*fracY);
                        drawPoint(xi+1, yi+1, fracX*fracY);
                    }
                    render();
                }
                i+=7;
                break;

                case 3: //arcTo
                {
                    let x1 = path[i+1];
                    let y1 = path[i+2];
                    let x2 = path[i+3];
                    let y2 = path[i+4];
                    let r = path[i+5];
                    let dx1 = x1 - x;
                    let dy1 = y1 - y;
                    let dx2 = x2 - x1;
                    let dy2 = y2 - y1;
                    let len1 = Math.hypot(dx1, dy1);
                    let len2 = Math.hypot(dx2, dy2);
                    if (len1 == 0 || len2 == 0 || r == 0) break;
                    let ux1 = dx1 / len1;
                    let uy1 = dy1 / len1;
                    let ux2 = dx2 / len2;
                    let uy2 = dy2 / len2;
                    let tx = ux1 + ux2;
                    let ty = uy1 + uy2;
                    let tlen = Math.hypot(tx, ty);
                    let bx = tx / tlen;
                    let by = ty / tlen;
                    let cos_theta = ux1*ux2 + uy1*uy2;
                    let theta = Math.acos(Math.max(-1, Math.min(1, cos_theta)));
                    let d = r / Math.sin(theta / 2);
                    let k = 1;    
                    let cx = x1 + bx * d;
                    let cy = y1 - by *  d;
                    if (Math.abs(Math.hypot(x - cx, y - cy) - r) > 0.1 
                    || Math.abs(Math.hypot(x2 - cx, y2 - cy) - r) > 0.1) 
                    {
                        k = -1;
                        cx = x1 - bx * d;
                        cy = y1 + by * d;
                    }
                    let startAngle = Math.atan2(y - cy, x - cx);
                    let endAngle = Math.atan2(y2 - cy, x2 - cy);
                    
                    if(k==1)
                    {
                        //TODO
                    }

                    console.log(k,[startAngle/Math.PI,endAngle/Math.PI])


                    for(let angle = startAngle; angle < endAngle; angle += 0.01) 
                    {
                        let x = cx + r*Math.cos(angle);
                        let y = cy + r*Math.sin(angle);
                        xi = Math.floor(x);
                        yi = Math.floor(y);
                        fracX = x - xi;
                        fracY = y - yi;

                        drawPoint(xi, yi, (1-fracX)*(1-fracY));
                        drawPoint(xi+1, yi, fracX*(1-fracY));
                        drawPoint(xi, yi+1, (1-fracX)*fracY);
                        drawPoint(xi+1, yi+1, fracX*fracY);
                    }

                    
                    render();
                    x = x2;
                    y = y2;
                }
                i += 6;
                break;
            }
        }
    }

    return this;
}

module.exports = Context