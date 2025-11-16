const Color = require("./Color");

function Context(width,height,getPixel,setPixel)
{
    let path = [];
    let x = 0;
    let y = 0;
    let fillColor = new Color();
    let strokeColor = new Color();
    
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
                    if(Math.abs(x2-x1)>Math.abs(y2-y1))
                    {
                        if(x1>x2) swap();
                        f1();
                    }
                    else
                    {
                        if(y1>y2) swap();
                        f2();
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
                            setPixel(X,Y,strokeColor.R,strokeColor.G,strokeColor.B,strokeColor.A)
                            if(D>0)
                            {
                                Y+=stepY;
                                D -= 2*dx
                            }
                            D += 2*dy
                        }
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
                            setPixel(X,Y,strokeColor.R,strokeColor.G,strokeColor.B,strokeColor.A);
                            if(D>0)
                            {
                                X+=stepX;
                                D -= 2*dy;
                            }
                            D += 2*dx;
                        }
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