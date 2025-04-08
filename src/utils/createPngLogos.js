const fs = require('fs');
const sharp = require('sharp');

async function createPngLogos() {
  const svgBuffer = fs.readFileSync('public/images/logo.svg');

  // Create 192x192 version
  await sharp(svgBuffer)
    .resize(192, 192)
    .toFile('public/images/logo192.png');

  // Create 512x512 version
  await sharp(svgBuffer)
    .resize(512, 512)
    .toFile('public/images/logo512.png');

  // Create favicon
  await sharp(svgBuffer)
    .resize(32, 32)
    .toFile('public/favicon.ico');
}

createPngLogos();