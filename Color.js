class Color
{
    R = 0;
    G = 0;
    B = 0;
    A = 1;

    constructor(...params)
    {
        if(params.length == 1 && typeof params[0] == "string")
        {
            let str = params[0]
            if(str.startsWith("#"))
            {
                this.R = Number.parseInt(str.substring(1,3),16);
                this.G = Number.parseInt(str.substring(4,6),16);
                this.B = Number.parseInt(str.substring(7,9),16);
            }
            else if(/rgb\(\d+\,\d+\,\d+\)/.test(str))
            {
                [this.R,this.G,this.B] = str.slice(4,-1).split(",").map(Number);
            }
            else if(/rgba\(\d+\,\d+\,\d+\,\d+(\.\d+)?\)/.test(str))
            {
                [this.R,this.G,this.B,this.A] = str.slice(5,-1).split(",").map(Number);
            }
        }
        else if(params.length == 3)
        {
            [this.R,this.G,this.B] = params;
        }
        else if(params.length == 4)
        {
            [this.R,this.G,this.B,this.A] = params;
        }
    }

    toHex()
    {
        return "#" + [this.R,this.G,this.B].map(o=>o.toString(16).padStart(2,"0")).join("");
    }
}

module.exports = Color;