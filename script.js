import { convertPixelArrayToRGB, quantizate, getPixelArray, thinArray } from './utils/imageProcessor.js';
import { generateColorPalettes } from './utils/colorPaletteGenerator.js';

const imageInputButton = document.querySelector(".image-input-button");
imageInputButton.addEventListener("click", () => document.querySelector('.image-input').click());

const fileInput = document.querySelector('.image-input');
fileInput.addEventListener('change', handleImageChange);

function handleImageChange(e) {
    const image = e.target.files[0];
    if(!image) {
        console.error('No file found');
        return;
    }

    // process image data on load
    const reader = new FileReader();
    reader.addEventListener("load", e => {
        imageInputButton.style.backgroundImage = `url(${reader.result})`;
        imageInputButton.style.backgroundSize = 'contain';
        imageInputButton.style.borderStyle = 'none';

        // process image on load
        const img = document.createElement("img");
        img.addEventListener("load", () => {

            // get pixel data
            const colorArr = getQuantizedArray(img);

            // generate palettes
            const colorPalettes = generateColorPalettes(colorArr);

            // TODO draw to dom for testing
            updateDOM(colorPalettes.base);
            updateDOM(colorPalettes.combinedMonochromatic);
            colorPalettes.monochromatic.forEach(e => updateDOM(e));
        });
        img.src = e.target.result
    });

    // read upload data if any
    if(image){
        reader.readAsDataURL(image);
    }
}

function updateDOM(colorArr) {
    for(let c of colorArr) {
        const div = document.createElement('div');
        div.style.backgroundColor = `rgb(${c.r}, ${c.g}, ${c.b})`;
        div.textContent = `rgb(${c.r}, ${c.g}, ${c.b}, ${c.L})`;
        document.querySelector('body').appendChild(div);
    }
}

function getQuantizedArray(img) {

    // create pixel and rgb array, sort by perceived luminosity
    const pixelArr = getPixelArray(img);
    const rgbArr = convertPixelArrayToRGB(pixelArr);
    rgbArr.sort((p1, p2) => {
        return p1.L - p2.L;
    });

    // thin array, save 10 from every 10% section of luminosity
    const thinnedArr = thinArray(rgbArr, 10, 0.1);

    // quantize values, sort by perceived luminosity
    const quantizedArr = quantizate(thinnedArr);
    quantizedArr.sort((p1, p2) => {
        return p1.L - p2.L;
    });

    // return without duplicates
    let uniqueQuantizedArr = quantizedArr.filter((element, index, self) => {
        return index === self.findIndex((t) => (
            t.r === element.r && t.g === element.g && t.b === element.b
        ));
    });
    return uniqueQuantizedArr;
}