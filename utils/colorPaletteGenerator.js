export function generateColorPalettes(quantizedPixelArr) {
    // generate combinedMonochromatic
    let hueArray = quantizedPixelArr.map(e => {
        return RGBtoHSV(e.r, e.g, e.b).h;
    });
    let combinedMonochromatic = generateMonochromatic([...hueArray.reverse()], hueArray.length).reverse();

    // generate monochromatic
    let monochromatic = [];
    quantizedPixelArr.forEach((color) => {
        let hsv = RGBtoHSV(color.r, color.g, color.b);
        monochromatic.push(generateMonochromatic([hsv.h], 8).reverse());
    });

    return {
        base: quantizedPixelArr,
        combinedMonochromatic,
        monochromatic,
    };
}

// modified from https://gist.github.com/mjackson/5311256
function HSVtoRGB(h, s, v) {
    h /= 360;
    s /= 100;
    v /= 100;

    let r, g, b;
  
    let i = Math.floor(h * 6);
    let f = h * 6 - i;
    let p = v * (1 - s);
    let q = v * (1 - f * s);
    let t = v * (1 - (1 - f) * s);
  
    switch (i % 6) {
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
    }
  
    return { 
        r: r * 255, 
        g: g * 255, 
        b: b * 255 
    };
  }

function RGBtoHSV (r, g, b) {
    let rabs, gabs, babs, rr, gg, bb, h, s, v, diff, diffc, percentRoundFn;
    rabs = r / 255;
    gabs = g / 255;
    babs = b / 255;
    v = Math.max(rabs, gabs, babs),
    diff = v - Math.min(rabs, gabs, babs);
    diffc = c => (v - c) / 6 / diff + 1 / 2;
    percentRoundFn = num => Math.round(num * 100) / 100;
    if (diff == 0) {
        h = s = 0;
    } else {
        s = diff / v;
        rr = diffc(rabs);
        gg = diffc(gabs);
        bb = diffc(babs);

        if (rabs === v) {
            h = bb - gg;
        } else if (gabs === v) {
            h = (1 / 3) + rr - bb;
        } else if (babs === v) {
            h = (2 / 3) + gg - rr;
        }
        if (h < 0) {
            h += 1;
        }else if (h > 1) {
            h -= 1;
        }
    }
    return {
        h: Math.round(h * 360),
        s: percentRoundFn(s * 100),
        v: percentRoundFn(v * 100)
    };
}

// modified from https://sighack.com/post/procedural-color-algorithms-monochromatic-color-scheme
function generateMonochromatic(hue, count) {
    // adjust for multi hue
    if(hue.length > 1){ 
        hue = [0, ...hue, 0];
    }

    count += 2;
    let scale = [];
    let indexShift = 0;
    for (let i = 0; i < count; i++) {
        let saturation = 100;
        let brightness = map3(i, 0, count - 1, 100, 0, 1.6, 'EASE_IN');
        if (i < count / 2)
        saturation = map3(i, 0, count / 2 - 1, 0, 100, 1.6, 'EASE_IN');
        let rgb = HSVtoRGB(hue[indexShift], saturation, brightness);
        indexShift++;
        if(indexShift >= hue.length) indexShift = 0;
        let color = {
            r: rgb.r,
            g: rgb.g,
            b: rgb.b,
        }
        scale[i] = color;
    }
    return scale.slice(1, scale.length - 1);
}

// modified from https://sighack.com/post/procedural-color-algorithms-monochromatic-color-scheme
function map3(value, start1, stop1, start2, stop2, v, when) {
    let b = start2;
    let c = stop2 - start2;
    let t = value - start1;
    let d = stop1 - start1;
    let p = v;
    let out = 0;
    if (when == 'EASE_IN') {
      t /= d;
      out = c * Math.pow(t, p) + b;
    } else if (when == 'EASE_OUT') {
      t /= d;
      out = c * (1 - Math.pow(1 - t, p)) + b;
    } else if (when == 'EASE_IN_OUT') {
      t /= d / 2;
      if (t < 1) return c / 2 * Math.pow(t, p) + b;
      out = c / 2 * (2 - Math.pow(2 - t, p)) + b;
    }
    return out;
  }