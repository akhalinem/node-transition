import { Buffer } from 'node:buffer';
import fs from 'node:fs';

function detectImageType(buffer) {
    // Check PNG signature
    if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) {
        return 'png';
    }

    // Check JPEG signature
    if (buffer.subarray(0, 2).equals(Buffer.from([0xFF, 0xD8]))) {
        return 'jpeg';
    }

    // Check GIF signature
    if (buffer.toString().includes('GIF')) {
        return 'gif';
    }

    return null;
}

function parsePng(buffer) {
    const buff = Buffer.from(buffer);

    // Validate PNG signature
    if (detectImageType(buffer) !== 'png') {
        throw new Error('Not a valid PNG file');
    }

    // Check IHDR chunk:
    const ihdrLength = buffer.readUInt32BE(8);
    const ihdrType = buffer.toString('ascii', 12, 16);
 
    if (ihdrType !== 'IHDR' || ihdrLength !== 13) {
        throw new Error('Invalid PNG IHDR chunk');
    }

    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    const bitDepth = buffer.readUInt8(24);
    const colorType = buffer.readUInt8(25);

    // Return metadata object
    return {
        width,
        height,
        bitDepth,
        colorType
    };
}

function parseJpeg(buffer) {
    // Validate JPEG signature (FF D8)
    if (detectImageType(buffer) !== 'jpeg') {
        throw new Error('Not a valid JPEG file');
    }

    // Find SOF marker (FF C0 or FF C2)
    //   - Search through file for marker
    let offset = 2; // Start after SOI marker
    while (offset < buffer.length) {
        if (buffer[offset] === 0xFF) {
            const marker = buffer[offset + 1];
            if (marker === 0xC0 || marker === 0xC2) {
                break; // Found SOF marker
            } else {
                offset += 2
            }
        } else {
            offset++;
        }
    }

    if (offset >= buffer.length) {
        throw new Error('SOF marker not found in JPEG file');
    }
    // Read from SOF:
    //   - Height (SOF+5, 2 bytes, big-endian)
    //   - Width (SOF+7, 2 bytes, big-endian)
    //   - Components (SOF+9, 1 byte)
    const height = buffer.readUInt16BE(offset + 5);
    const width = buffer.readUInt16BE(offset + 7);
    const components = buffer.readUInt8(offset + 9);

    // Return metadata object
    return {
        width,
        height,
        components
    };
}

function parseGif(buffer) {
    // Validate GIF signature
    if (detectImageType(buffer) !== 'gif') {
        throw new Error('Not a valid GIF file');
    }
    // Read version (offset 3-5)
    const version = buffer.toString('ascii', 3, 6);
    // Read dimensions:
    //   - Width (offset 6, 2 bytes, little-endian)
    //   - Height (offset 8, 2 bytes, little-endian)
    const width = buffer.readUInt16LE(6);
    const height = buffer.readUInt16LE(8);
    // Parse packed fields (offset 10):
    //   - Global color table flag (bit 7)
    //   - Color resolution (bits 4-6)
    //   - Global color table size (bits 0-2)
    const packedFields = buffer.readUInt8(10);
    const globalColorTableFlag = (packedFields & 0b10000000) >> 7;
    const colorResolution = (packedFields & 0b01110000) >> 4;
    const globalColorTableSize = packedFields & 0b00000111;
    // Return metadata object
    return {
        version,
        width,
        height,
        globalColorTableFlag,
        colorResolution,
        globalColorTableSize
    };
}

function extractMetadata(filePath) {
    // Read first 1024 bytes (enough for headers)
    const buffer = fs.openSync(filePath, 'r');
    const headerBuffer = Buffer.alloc(1024);
    fs.readSync(buffer, headerBuffer, 0, 1024, 0);
    fs.closeSync(buffer);
    // Detect file type
    const fileType = detectImageType(headerBuffer);
    const size = fs.statSync(filePath).size;
    // Parse based on type
    let metadata;
    switch (fileType) {
        case 'png':
            metadata = parsePng(headerBuffer);
            break;
        case 'jpeg':
            metadata = parseJpeg(headerBuffer);
            break;
        case 'gif':
            metadata = parseGif(headerBuffer);
            break;
        default:
            throw new Error('Unsupported image format');
    }
    // Return formatted metadata
    return { format: fileType, size, metadata };
}

// const filePath = '/Users/akhalinem/Downloads/Baby Yoda Fantasy Art Wallpaper.jpg'
// const metadata = extractMetadata(filePath);
// console.log(metadata);