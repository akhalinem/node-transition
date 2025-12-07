// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Binary Data & Protocols - Real-World Buffer Usage
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📡 Binary Data & Protocols');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// ========================================
// Part 1: Binary File Headers
// ========================================

console.log('=== 1. Reading Binary File Headers ===\n');

console.log('Many file formats start with "magic numbers"\n');

// PNG file header
const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
console.log('PNG Header:');
console.log('  Hex:', pngHeader.toString('hex'));
console.log('  Bytes:', [...pngHeader]);
console.log('  Signature: \\x89PNG\\r\\n\\x1a\\n');
console.log('');

// JPEG file header
const jpegHeader = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
console.log('JPEG Header:');
console.log('  Hex:', jpegHeader.toString('hex'));
console.log('  First 2 bytes: FF D8 (JPEG SOI marker)');
console.log('');

// PDF file header
const pdfHeader = Buffer.from('%PDF-1.4');
console.log('PDF Header:');
console.log('  String:', pdfHeader.toString());
console.log('  Hex:', pdfHeader.toString('hex'));
console.log('');

// Function to detect file type
function detectFileType(buffer) {
  // Check first few bytes
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && 
      buffer[2] === 0x4E && buffer[3] === 0x47) {
    return 'PNG';
  }
  if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
    return 'JPEG';
  }
  if (buffer.toString('utf8', 0, 4) === '%PDF') {
    return 'PDF';
  }
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return 'GIF';
  }
  if (buffer.toString('utf8', 0, 4) === 'PK\x03\x04') {
    return 'ZIP';
  }
  return 'Unknown';
}

console.log('File type detection:');
console.log('  PNG:', detectFileType(pngHeader));
console.log('  JPEG:', detectFileType(jpegHeader));
console.log('  PDF:', detectFileType(pdfHeader));
console.log('');

// ========================================
// Part 2: Creating Binary Protocol Messages
// ========================================

console.log('=== 2. Binary Protocol Messages ===\n');

console.log('Example: Custom protocol message format:');
console.log('┌────────┬──────┬──────┬─────────────┐');
console.log('│ Length │ Type │ ID   │ Payload     │');
console.log('│ 2 bytes│ 1 b  │ 4 b  │ Variable    │');
console.log('└────────┴──────┴──────┴─────────────┘\n');

function createMessage(type, id, payload) {
  const payloadBuf = Buffer.from(payload);
  const totalLength = 2 + 1 + 4 + payloadBuf.length;
  
  const message = Buffer.alloc(totalLength);
  
  let offset = 0;
  
  // Write length (2 bytes, big-endian)
  message.writeUInt16BE(totalLength, offset);
  offset += 2;
  
  // Write type (1 byte)
  message.writeUInt8(type, offset);
  offset += 1;
  
  // Write ID (4 bytes, big-endian)
  message.writeUInt32BE(id, offset);
  offset += 4;
  
  // Write payload
  payloadBuf.copy(message, offset);
  
  return message;
}

const msg = createMessage(1, 12345, 'Hello, Protocol!');

console.log('Created message:');
console.log('  Buffer:', msg);
console.log('  Hex:', msg.toString('hex'));
console.log('  Length:', msg.length, 'bytes');
console.log('');

// Parse the message
function parseMessage(buffer) {
  let offset = 0;
  
  const length = buffer.readUInt16BE(offset);
  offset += 2;
  
  const type = buffer.readUInt8(offset);
  offset += 1;
  
  const id = buffer.readUInt32BE(offset);
  offset += 4;
  
  const payload = buffer.slice(offset).toString();
  
  return { length, type, id, payload };
}

const parsed = parseMessage(msg);
console.log('Parsed message:');
console.log('  Length:', parsed.length);
console.log('  Type:', parsed.type);
console.log('  ID:', parsed.id);
console.log('  Payload:', parsed.payload);
console.log('');

// ========================================
// Part 3: IP Address Handling
// ========================================

console.log('=== 3. IP Address Handling ===\n');

console.log('🔹 IPv4 Address (4 bytes)\n');

// Convert IP string to buffer
function ipv4ToBuffer(ipString) {
  const parts = ipString.split('.').map(Number);
  return Buffer.from(parts);
}

// Convert buffer to IP string
function bufferToIpv4(buffer) {
  return [...buffer].join('.');
}

const ip = '192.168.1.100';
const ipBuf = ipv4ToBuffer(ip);

console.log('IP Address:', ip);
console.log('As buffer:', ipBuf);
console.log('As hex:', ipBuf.toString('hex'));
console.log('Back to string:', bufferToIpv4(ipBuf));
console.log('');

console.log('🔹 IPv6 Address (16 bytes)\n');

// IPv6 in compact form
const ipv6String = '2001:0db8:85a3:0000:0000:8a2e:0370:7334';
const ipv6Parts = ipv6String.split(':');

const ipv6Buf = Buffer.alloc(16);
for (let i = 0; i < 8; i++) {
  const value = parseInt(ipv6Parts[i], 16);
  ipv6Buf.writeUInt16BE(value, i * 2);
}

console.log('IPv6:', ipv6String);
console.log('As buffer:', ipv6Buf);
console.log('As hex:', ipv6Buf.toString('hex'));
console.log('');

// ========================================
// Part 4: Checksums and Hashing
// ========================================

console.log('=== 4. Checksums ===\n');

console.log('🔹 Simple Checksum (XOR)\n');

function calculateChecksum(buffer) {
  let checksum = 0;
  for (const byte of buffer) {
    checksum ^= byte;
  }
  return checksum;
}

const data = Buffer.from('Hello World');
const checksum = calculateChecksum(data);

console.log('Data:', data.toString());
console.log('Checksum:', '0x' + checksum.toString(16));
console.log('');

// Add checksum to message
const dataWithChecksum = Buffer.concat([
  data,
  Buffer.from([checksum])
]);

console.log('Data with checksum:', dataWithChecksum);
console.log('');

// Verify checksum
function verifyChecksum(buffer) {
  const data = buffer.slice(0, -1);
  const receivedChecksum = buffer[buffer.length - 1];
  const calculatedChecksum = calculateChecksum(data);
  return receivedChecksum === calculatedChecksum;
}

console.log('Checksum valid?', verifyChecksum(dataWithChecksum));
console.log('');

console.log('🔹 CRC32 Checksum (Industry Standard)\n');

const crc32 = require('buffer-crc32');

try {
  const crcData = Buffer.from('Important data');
  const crc = crc32(crcData);
  
  console.log('Data:', crcData.toString());
  console.log('CRC32:', crc);
  console.log('As hex:', crc.toString('hex'));
  console.log('As number:', crc.readUInt32BE(0));
} catch (err) {
  console.log('Note: Install buffer-crc32 package for CRC32:');
  console.log('  npm install buffer-crc32');
}
console.log('');

// ========================================
// Part 5: Bit Manipulation
// ========================================

console.log('=== 5. Bit Manipulation ===\n');

console.log('🔹 Reading Individual Bits\n');

const byte = 0b10110101; // 181 in decimal
const byteBuf = Buffer.from([byte]);

console.log('Byte:', byte, '(binary: ' + byte.toString(2).padStart(8, '0') + ')');
console.log('');

// Check individual bits
function getBit(buffer, byteOffset, bitPosition) {
  const byte = buffer[byteOffset];
  return (byte >> bitPosition) & 1;
}

console.log('Bits:');
for (let i = 7; i >= 0; i--) {
  const bit = getBit(byteBuf, 0, i);
  console.log(`  Bit ${i}: ${bit}`);
}
console.log('');

console.log('🔹 Setting Individual Bits\n');

function setBit(buffer, byteOffset, bitPosition, value) {
  let byte = buffer[byteOffset];
  if (value) {
    byte |= (1 << bitPosition);  // Set bit to 1
  } else {
    byte &= ~(1 << bitPosition); // Set bit to 0
  }
  buffer[byteOffset] = byte;
}

const bitBuf = Buffer.alloc(1);
console.log('Initial:', bitBuf[0].toString(2).padStart(8, '0'));

setBit(bitBuf, 0, 0, 1);
setBit(bitBuf, 0, 3, 1);
setBit(bitBuf, 0, 7, 1);

console.log('After setting bits 0, 3, 7:', bitBuf[0].toString(2).padStart(8, '0'));
console.log('Decimal:', bitBuf[0]);
console.log('');

// ========================================
// Part 6: Packing and Unpacking Structs
// ========================================

console.log('=== 6. Packing/Unpacking Structs ===\n');

console.log('Example: User record structure');
console.log('┌────────┬────────┬──────────────┬─────────┐');
console.log('│ ID     │ Age    │ Name (20b)   │ Active  │');
console.log('│ 4 bytes│ 2 bytes│ 20 bytes     │ 1 byte  │');
console.log('└────────┴────────┴──────────────┴─────────┘\n');

function packUser(id, age, name, active) {
  const buffer = Buffer.alloc(27);
  let offset = 0;
  
  // ID (4 bytes)
  buffer.writeUInt32BE(id, offset);
  offset += 4;
  
  // Age (2 bytes)
  buffer.writeUInt16BE(age, offset);
  offset += 2;
  
  // Name (20 bytes, null-padded)
  const nameBytes = buffer.write(name, offset, 20, 'utf8');
  offset += 20;
  
  // Active (1 byte, boolean)
  buffer.writeUInt8(active ? 1 : 0, offset);
  
  return buffer;
}

function unpackUser(buffer) {
  let offset = 0;
  
  const id = buffer.readUInt32BE(offset);
  offset += 4;
  
  const age = buffer.readUInt16BE(offset);
  offset += 2;
  
  const name = buffer.toString('utf8', offset, offset + 20).replace(/\0/g, '');
  offset += 20;
  
  const active = buffer.readUInt8(offset) === 1;
  
  return { id, age, name, active };
}

const userBuffer = packUser(12345, 30, 'Alice', true);

console.log('Packed user:');
console.log('  Buffer:', userBuffer);
console.log('  Hex:', userBuffer.toString('hex'));
console.log('  Length:', userBuffer.length, 'bytes');
console.log('');

const user = unpackUser(userBuffer);
console.log('Unpacked user:');
console.log('  ID:', user.id);
console.log('  Age:', user.age);
console.log('  Name:', user.name);
console.log('  Active:', user.active);
console.log('');

// ========================================
// Part 7: Base64 Encoding (Data URLs)
// ========================================

console.log('=== 7. Base64 Encoding (Data URLs) ===\n');

// Simulate a small image (1x1 red pixel GIF)
const gifData = Buffer.from([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, // GIF89a
  0x01, 0x00, 0x01, 0x00,             // 1x1 pixels
  0x80, 0x00, 0x00,                   // Global color table
  0xFF, 0x00, 0x00,                   // Red
  0x00, 0x00, 0x00,                   // Black (unused)
  0x21, 0xF9, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, // Graphics control
  0x2C, 0x00, 0x00, 0x00, 0x00,       // Image descriptor
  0x01, 0x00, 0x01, 0x00, 0x00,       // 1x1 pixels
  0x02, 0x02, 0x44, 0x01, 0x00,       // Image data
  0x3B                                // Trailer
]);

const base64 = gifData.toString('base64');
const dataUrl = `data:image/gif;base64,${base64}`;

console.log('Binary data:', gifData.length, 'bytes');
console.log('Base64:', base64);
console.log('');
console.log('Data URL (for HTML):');
console.log(dataUrl);
console.log('');

// Decode back
const decoded = Buffer.from(base64, 'base64');
console.log('Decoded matches original?', gifData.equals(decoded));
console.log('');

// ========================================
// Summary
// ========================================

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📝 Binary Data Summary');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('✅ File Headers:');
console.log('   • Magic numbers identify file types');
console.log('   • Check first few bytes to detect format\n');

console.log('✅ Binary Protocols:');
console.log('   • Define message structure');
console.log('   • Use fixed-size headers');
console.log('   • Handle endianness correctly\n');

console.log('✅ Network Data:');
console.log('   • IP addresses stored as bytes');
console.log('   • Big-endian for network protocols');
console.log('   • Checksums for integrity\n');

console.log('✅ Bit Manipulation:');
console.log('   • Read/write individual bits');
console.log('   • Use bit masks and shifts');
console.log('   • Pack multiple flags in one byte\n');

console.log('✅ Struct Packing:');
console.log('   • Fixed-size records');
console.log('   • Efficient storage');
console.log('   • Interop with C/C++\n');

console.log('✅ Encoding:');
console.log('   • Base64 for text transmission');
console.log('   • Hex for debugging');
console.log('   • UTF-8 for text\n');

console.log('Next: Buffers with Streams! →\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
