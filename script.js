import { convertPixelArrayToRGB, quantizate, getPixelArray, thinArray } from './utils/imageProcessor.js';
import { generateColorPalettes, RGBtoHSV } from './utils/colorPaletteGenerator.js';

let mainColorButtons = [];
let selectedPaletteButtons = [];
let colorPalettes;

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
            colorPalettes = generateColorPalettes(colorArr);

            // add palettes to DOM
            let palettes = document.querySelector('.palettes');
            palettes.innerHTML = '';
            mainColorButtons = [];
            selectedPaletteButtons = [];
            addPalette('Base Colors', colorPalettes.combinedMonochromatic, palettes, true);
            const subPalette = document.createElement('div')
            subPalette.classList.add('sub-palettes');
            palettes.appendChild(subPalette);

        });
        img.src = e.target.result
    });

    // read upload data if any
    if(image){
        reader.readAsDataURL(image);
    }
}

function addSubPalettes(i) {
    let subPalettes = document.querySelector('.sub-palettes');
    subPalettes.innerHTML = '';
    selectedPaletteButtons = selectedPaletteButtons.slice(0, 1);
    addPalette('Monochromatic', colorPalettes.monochromatic[i], subPalettes);
    addPalette('Triadic', colorPalettes.triadic[i], subPalettes);
    addPalette('Tetradic', colorPalettes.tetradic[i], subPalettes);
    addPalette('Adjacent with Complementary', colorPalettes.adjacentComplementary[i], subPalettes);
}

function addPalette(name, palette, parentElement, mainColors = false) {

    // create palette container
    const paletteContainer = document.createElement('div');
    paletteContainer.classList.add('palette-container');
    parentElement.appendChild(paletteContainer);

    // create palette name and selection button
    const nameContainer = document.createElement('div');
    nameContainer.classList.add('palette-name-container');
    paletteContainer.appendChild(nameContainer);

    const selectPaletteButton = document.createElement('button');
    selectPaletteButton.classList.add('select-palette-button');
    selectPaletteButton.textContent = 'Select';
    selectPaletteButton.addEventListener('click', e => {
        selectedPaletteButtons.forEach(b => {
            b.classList.remove('palette-button-selected');
        });
        selectPaletteButton.classList.add('palette-button-selected');

        // assign colors on palette selection
        let c = palette[7];
        document.documentElement.style.setProperty('--text', `rgb(${c.r}, ${c.g}, ${c.b})`);
        c = palette[5];
        document.documentElement.style.setProperty('--highlight', `rgb(${c.r}, ${c.g}, ${c.b})`);
        c = palette[3];
        document.documentElement.style.setProperty('--main', `rgb(${c.r}, ${c.g}, ${c.b})`);
        c = palette[1];
        document.documentElement.style.setProperty('--support', `rgb(${c.r}, ${c.g}, ${c.b})`);        
    });
    selectedPaletteButtons.push(selectPaletteButton);
    nameContainer.appendChild(selectPaletteButton);

    const paletteName = document.createElement(`${mainColors ? 'h2' : 'h3'}`);
    paletteName.textContent = name;
    nameContainer.appendChild(paletteName);

    // create individual color buttons
    const colorButtonsWrapper = document.createElement('div');
    colorButtonsWrapper.classList.add('main-color-buttons-wrapper');
    paletteContainer.appendChild(colorButtonsWrapper);

    for(let i = 0; i < palette.length; i++) {
        let c = palette[i];
        const buttonContainer = document.createElement('div');

        const button = document.createElement('button');

        // set styling
        button.classList.add(`${mainColors ? 'main-' : ''}color-button`, 'hide-inner-text', 'gradient-border');
        button.style.backgroundColor = `rgb(${c.r}, ${c.g}, ${c.b})`;

        // set onclick callbacks
        let mainCallback = function mainCallback() {
            mainColorButtons.forEach(b => {
                b.classList.add('hide-inner-text');
            });
            button.classList.remove('hide-inner-text');
            addSubPalettes(i);
        }
        let secondaryCallback = function secondaryCallback() {
            button.classList.toggle('hide-inner-text');
        }
        let callback = mainColors ? mainCallback : secondaryCallback;
        button.addEventListener('click', callback);

        if(mainColors) mainColorButtons.push(button);
        buttonContainer.appendChild(button);

        // add rgb text to dom
        const textContainer = document.createElement('div');

        const rText = document.createElement('p');
        rText.textContent = `R: ${Math.round(c.r)}`;
        rText.style.color = RGBtoHSV(c.r, c.g, c.b).v < 80 ? 'white' : 'black';
        textContainer.appendChild(rText);
        
        const gText = document.createElement('p');
        gText.textContent = `G: ${Math.round(c.g)}`;
        gText.style.color = RGBtoHSV(c.r, c.g, c.b).v < 80 ? 'white' : 'black';
        textContainer.appendChild(gText);
        
        const bText = document.createElement('p');
        bText.textContent = `B: ${Math.round(c.b)}`;
        bText.style.color = RGBtoHSV(c.r, c.g, c.b).v < 80 ? 'white' : 'black';
        textContainer.appendChild(bText);
        
        button.appendChild(textContainer);
        
        colorButtonsWrapper.appendChild(buttonContainer);
    };
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