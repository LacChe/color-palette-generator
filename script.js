import { convertPixelArrayToRGB, quantizate } from './imageUtils/imageProcessor.js';

const SHRINK_FACTOR = 0.1;

let quantizedPixelArr = [];

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
        let imgOnLoadCallback = function imgOnLoadCallback() {
            // create canvas elements
            const cvs = document.createElement("canvas");
            const ctx = cvs.getContext("2d");

            // scale image
            let newWidth = 100 / SHRINK_FACTOR;
            let newHeight = 100 / SHRINK_FACTOR;
            if(img.width > img.height) {
                newHeight *= img.height / img.width;
            } else {
                newWidth *= img.width / img.height;
            }
            ctx.canvas.width = newWidth;
            ctx.canvas.height = newHeight;
            ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);

            // create rgb array
            const pixelArr = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data;
            const rgbArr = convertPixelArrayToRGB(pixelArr);
            rgbArr.sort((p1, p2) => {
                return p1.L - p2.L;
            });

            // quantize values
            const quantizedArr = quantizate(rgbArr);
            quantizedArr.sort((p1, p2) => {
                return p1.L - p2.L;
            });

            return quantizedArr;
        }
        img.addEventListener("load", () => {
            quantizedPixelArr = imgOnLoadCallback();
            updateDOM();
        });
        img.src = e.target.result
    });

    // read upload data if any
    if(image){
        reader.readAsDataURL(image);
    }
}

function updateDOM() {
    for(let c of quantizedPixelArr) {
        const div = document.createElement('div');
        div.style.backgroundColor = `rgb(${c.r}, ${c.g}, ${c.b})`;
        div.textContent = `rgb(${c.r}, ${c.g}, ${c.b}, ${c.L})`;
        document.querySelector('body').appendChild(div);
    }
}