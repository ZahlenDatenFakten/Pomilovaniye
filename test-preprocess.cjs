const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const Tesseract = require('tesseract.js');

const imgPath = 'C:/Users/tamer/.gemini/antigravity/brain/8035792a-f1b6-4b0f-a100-f6469c994b92/.user_uploaded/media_1787153968395.png';

async function main() {
    const img = await loadImage(imgPath);
    const canvas = createCanvas(Math.round(img.width * 1.5), Math.round(img.height * 1.5));
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        
        // Binarize & Invert: If it's light text (gray > 120), make it BLACK (0). If dark background, make it WHITE (255)
        const isLight = gray > 140;
        const color = isLight ? 0 : 255;

        data[i] = color;
        data[i + 1] = color;
        data[i + 2] = color;
    }

    ctx.putImageData(imgData, 0, 0);
    const outBuffer = canvas.toBuffer('image/png');
    fs.writeFileSync('C:/Помилования/test-preprocessed.png', outBuffer);

    console.log("Running Tesseract on preprocessed image...");
    const { data: { text } } = await Tesseract.recognize('C:/Помилования/test-preprocessed.png', 'rus+eng');
    console.log("=== RAW TEXT ===");
    console.log(text);
}
main().catch(console.error);
