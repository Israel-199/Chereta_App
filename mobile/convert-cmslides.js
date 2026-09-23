const sharp = require('sharp');
const path = require('path');

async function fixSlides() {
  const slides = ['cmslide1.png', 'cmslide2.png', 'cmslide3.png'];
  for (const slide of slides) {
    const input = path.join(__dirname, 'assets', 'images', slide);
    const output = path.join(__dirname, 'assets', 'images', `new_${slide}`);
    try {
      await sharp(input).png().toFile(output);
    } catch (err) {
      console.error(`Error converting ${slide}:`, err);
    }
  }
}

fixSlides();
