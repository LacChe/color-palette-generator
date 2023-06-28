const MAX_DEPTH = 3; // 2^n = colors

export function quantizate(rgbArr, depth = 0) {

    // base cases
    if(rgbArr.length === 0) {
        return [{
            r: 255,
            g: 255,
            b: 255,
            Y: 1,
            L: 100,
        }];
    }
    if(depth === MAX_DEPTH || rgbArr.length === 1) {
        // average colors
        const colorSum = rgbArr.reduce(
            (sum, pixel) => {
                sum.r += pixel.r;
                sum.g += pixel.g;
                sum.b += pixel.b;
                sum.Y += pixel.Y;
                sum.L += pixel.L;
                return sum;
            },
            {
                r: 0,
                g: 0,
                b: 0,
                Y: 0,
                L: 0,
            }
        );
        const averageColor = {
            r: Math.round(colorSum.r / rgbArr.length),
            g: Math.round(colorSum.g / rgbArr.length),
            b: Math.round(colorSum.b / rgbArr.length),
            Y: colorSum.Y / rgbArr.length,
            L: colorSum.L / rgbArr.length,
        }
        return [averageColor];
    }

    // recursion
    return [
        ...quantizate(rgbArr.slice(0, rgbArr.length / 2), depth + 1),
        ...quantizate(rgbArr.slice(rgbArr.length / 2 + 1), depth + 1)
    ];
}

export function getLargestColorChannel(rgbArr) {
    // set initial values
    let rMin = Number.MAX_VALUE;
    let bMin = Number.MAX_VALUE;
    let gMin = Number.MAX_VALUE;
    
    let rMax = Number.MIN_VALUE;
    let bMax = Number.MIN_VALUE;
    let gMax = Number.MIN_VALUE;

    // find max and min for each channel
    rgbArr.forEach((pixel) => {
        rMin = Math.min(rMin, pixel.r);
        gMin = Math.min(gMin, pixel.g);
        bMin = Math.min(bMin, pixel.b);
    
        rMax = Math.max(rMax, pixel.r);
        gMax = Math.max(gMax, pixel.g);
        bMax = Math.max(bMax, pixel.b);
    });

    // find largest range
    const rRange = rMax - rMin;
    const gRange = gMax - gMin;
    const bRange = bMax - bMin;

    const biggestRange = Math.max(rRange, gRange, bRange);
    
    switch(biggestRange) {
        case rRange:
            return 'r';
        case gRange:
            return 'g';
        case bRange:
            return 'b';
        default:
            console.error('No matching color range');
            return;
    }
}

export function convertPixelArrayToRGB(pixelArr) {
    const rgbArr = [];
    for(let i = 0; i < pixelArr.length; i+=4) {

        // calculate luminance
        function sRGBtoLin(colorChannel) {
            if ( colorChannel <= 0.04045 ) {
                return colorChannel / 12.92;
            } else {
                return Math.pow((( colorChannel + 0.055)/1.055), 2.4);
            }
        }
        const vR = pixelArr[i] / 255;
        const vG = pixelArr[i + 1] / 255;
        const vB = pixelArr[i + 2] / 255;

        function YtoLstar(Y) {
        if ( Y <= (216/24389)) {
                return Y * (24389/27); 
            } else {
                return Math.pow(Y,(1/3)) * 116 - 16;
            }
        }

        rgbArr.push({
            r: pixelArr[i],
            g: pixelArr[i + 1],
            b: pixelArr[i + 2],
            Y: (0.2126 * sRGBtoLin(vR) + 0.7152 * sRGBtoLin(vG) + 0.0722 * sRGBtoLin(vB)),
            L: YtoLstar((0.2126 * sRGBtoLin(vR) + 0.7152 * sRGBtoLin(vG) + 0.0722 * sRGBtoLin(vB))),
        });
        rgbArr.length;
    }
    return rgbArr;
} 