let pixelArr = [];

const imageInputButton = document.querySelector(".image-input-button");
imageInputButton.addEventListener("click", () => document.querySelector('.image-input').click());

const fileInput = document.querySelector('.image-input');
fileInput.addEventListener('change', handleImageChange);

function handleImageChange(e) {
    const image = e.target.files[0];

    const reader = new FileReader();
    reader.addEventListener("load", e => {
        imageInputButton.style.backgroundImage = `url(${reader.result})`;
        imageInputButton.style.backgroundSize = 'contain';
        imageInputButton.style.backgroundRepeat= 'repeat';
        imageInputButton.style.border = 'white solid 2px';

        const img = document.createElement("img");
        img.addEventListener("load", e => {
            const cvs = document.createElement("canvas");
            const ctx = cvs.getContext("2d");
            ctx.drawImage(img, 0, 0);
            pixelArr = ctx.getImageData(0, 0, img.width, img.height).data;
            console.log(pixelArr.length);
        });
      
        img.src = e.target.result
    });

    // read upload data if any
    if(image){
        reader.readAsDataURL(image);
    }

}