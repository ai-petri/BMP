function Context(width,height,getPixel,setPixel)
{
    let path = [];
    

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

                    i += 3;
                break;

                case 1: //lineTo

                    i += 3;
                break;

            }
        }
    }

    return this;
}

module.exports = Context