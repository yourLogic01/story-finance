const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const toCrc = buf.subarray(4, 8 + len);
  buf.writeUInt32BE(crc32(toCrc), 8 + len);
  return buf;
}

function createMonochromeBadgePNG(size = 96) {
  const width = size;
  const height = size;
  const pixels = Buffer.alloc(width * height * 4, 0); // All transparent

  function setPixel(x, y, r, g, b, a) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const idx = (y * width + x) * 4;
    pixels[idx] = r;
    pixels[idx + 1] = g;
    pixels[idx + 2] = b;
    pixels[idx + 3] = a;
  }

  // Draw rounded rectangle
  function isInsideRoundedRect(x, y, rx, ry, rw, rh, rad) {
    if (x < rx || x >= rx + rw || y < ry || y >= ry + rh) return false;
    // Check 4 corners
    const left = rx + rad;
    const right = rx + rw - rad;
    const top = ry + rad;
    const bottom = ry + rh - rad;

    if (x < left && y < top) {
      return (x - left) ** 2 + (y - top) ** 2 <= rad ** 2;
    }
    if (x > right && y < top) {
      return (x - right) ** 2 + (y - top) ** 2 <= rad ** 2;
    }
    if (x < left && y > bottom) {
      return (x - left) ** 2 + (y - bottom) ** 2 <= rad ** 2;
    }
    if (x > right && y > bottom) {
      return (x - right) ** 2 + (y - bottom) ** 2 <= rad ** 2;
    }
    return true;
  }

  const walletX = 14;
  const walletY = 24;
  const walletW = 68;
  const walletH = 48;
  const walletR = 10;

  // Flap geometry
  const flapX = 48;
  const flapY = 36;
  const flapW = 34;
  const flapH = 24;
  const flapR = 7;

  // Clasp center
  const claspX = 64;
  const claspY = 48;
  const claspR = 5;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // 1. Check if inside main wallet
      const inWallet = isInsideRoundedRect(x, y, walletX, walletY, walletW, walletH, walletR);

      // 2. Check if in flap outline gap (to make flap distinguishable)
      const inFlapBorder =
        (x >= flapX - 2 && x <= flapX + flapW && y >= flapY - 2 && y <= flapY + flapH + 2) &&
        !isInsideRoundedRect(x, y, flapX, flapY, flapW, flapH, flapR) &&
        (x <= flapX || y <= flapY || y >= flapY + flapH);

      // 3. Check if in clasp cutout hole
      const distToClaspSq = (x - claspX) ** 2 + (y - claspY) ** 2;
      const inClaspHole = distToClaspSq <= claspR ** 2;

      if (inWallet) {
        if (inFlapBorder || inClaspHole) {
          // Transparent cut-out detail
          setPixel(x, y, 0, 0, 0, 0);
        } else {
          // Opaque White Silhouette
          setPixel(x, y, 255, 255, 255, 255);
        }
      }
    }
  }

  // Build PNG chunks
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR: 96x96, 8-bit depth, RGBA (color type 6)
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Scanlines with filter byte 0
  const scanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 4);
    scanlines[rowOffset] = 0; // filter none
    pixels.copy(scanlines, rowOffset + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressedData = zlib.deflateSync(scanlines);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const badgeBuffer = createMonochromeBadgePNG(96);
const outPath = path.join(__dirname, '..', 'public', 'icons', 'badge-96x96.png');
fs.writeFileSync(outPath, badgeBuffer);
console.log('Successfully generated monochrome badge at:', outPath, 'Size:', badgeBuffer.length, 'bytes');
