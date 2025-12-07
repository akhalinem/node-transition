// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Buffer Operations - Reading, Writing, and Manipulating
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔧 Buffer Operations');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// ========================================
// Part 1: Reading from Buffers
// ========================================

console.log('=== 1. Reading from Buffers ===\n');

const buf = Buffer.from([0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x20, 0x57, 0x6F, 0x72, 0x6C, 0x64]);

console.log('Buffer:', buf);
console.log('As string:', buf.toString(), '\n');

console.log('🔹 Reading Individual Bytes\n');
console.log('buf[0]:', buf[0], '→', String.fromCharCode(buf[0]));
console.log('buf[1]:', buf[1], '→', String.fromCharCode(buf[1]));
console.log('buf[2]:', buf[2], '→', String.fromCharCode(buf[2]));
console.log('');

console.log('🔹 Reading Numbers (Integers)\n');

// Create buffer with numbers
const numBuf = Buffer.allocUnsafe(8);

// Write numbers in different formats
numBuf.writeInt8(127, 0);          // 1 byte signed
numBuf.writeUInt16BE(1000, 1);     // 2 bytes unsigned, big-endian
numBuf.writeInt32LE(-500000, 3);   // 4 bytes signed, little-endian

console.log('Buffer:', numBuf);
console.log('');

// Read them back
console.log('Read Int8 at offset 0:', numBuf.readInt8(0));
console.log('Read UInt16BE at offset 1:', numBuf.readUInt16BE(1));
console.log('Read Int32LE at offset 3:', numBuf.readInt32LE(3));
console.log('');

console.log('🔹 Reading Floating Point Numbers\n');

const floatBuf = Buffer.allocUnsafe(8);
floatBuf.writeFloatLE(3.14, 0);    // 4 bytes
floatBuf.writeDoubleLE(2.718281828, 4); // 8 bytes (only 4 used here)

console.log('Float:', floatBuf.readFloatLE(0));
console.log('Double:', floatBuf.readDoubleLE(4).toFixed(9));
console.log('');

// ========================================
// Part 2: Writing to Buffers
// ========================================

console.log('=== 2. Writing to Buffers ===\n');

console.log('🔹 Writing Strings\n');

const writeBuf = Buffer.alloc(20);

const bytesWritten = writeBuf.write('Hello', 0, 'utf8');
console.log('Wrote', bytesWritten, 'bytes');
console.log('Buffer:', writeBuf);
console.log('As string:', writeBuf.toString('utf8', 0, bytesWritten), '\n');

// Write at offset
writeBuf.write(' World', 5, 'utf8');
console.log('After writing at offset 5:', writeBuf.toString().trim(), '\n');

console.log('🔹 Writing Individual Bytes\n');

const byteBuf = Buffer.alloc(5);
byteBuf[0] = 72;  // H
byteBuf[1] = 101; // e
byteBuf[2] = 108; // l
byteBuf[3] = 108; // l
byteBuf[4] = 111; // o

console.log('Buffer:', byteBuf);
console.log('As string:', byteBuf.toString(), '\n');

console.log('🔹 Writing Numbers\n');

const numberBuf = Buffer.alloc(12);

// Different integer types
numberBuf.writeUInt8(255, 0);           // Max unsigned 8-bit: 255
numberBuf.writeInt8(-128, 1);           // Min signed 8-bit: -128
numberBuf.writeUInt16LE(65535, 2);      // Max unsigned 16-bit
numberBuf.writeInt16BE(-32768, 4);      // Min signed 16-bit
numberBuf.writeUInt32LE(4294967295, 6); // Max unsigned 32-bit

console.log('Buffer with various numbers:', numberBuf);
console.log('Hex:', numberBuf.toString('hex'), '\n');

console.log('Reading them back:');
console.log('  UInt8:', numberBuf.readUInt8(0));
console.log('  Int8:', numberBuf.readInt8(1));
console.log('  UInt16LE:', numberBuf.readUInt16LE(2));
console.log('  Int16BE:', numberBuf.readInt16BE(4));
console.log('  UInt32LE:', numberBuf.readUInt32LE(6));
console.log('');

// ========================================
// Part 3: Slicing Buffers
// ========================================

console.log('=== 3. Slicing Buffers ===\n');

const original = Buffer.from('Hello World!');
console.log('Original:', original.toString());
console.log('');

// Slice creates a view (not a copy!)
const slice = original.slice(0, 5);
console.log('Slice (0, 5):', slice.toString());
console.log('');

console.log('⚠️  Slices share memory with original!\n');

// Modify the slice
slice[0] = 89; // Change 'H' to 'Y'

console.log('After modifying slice:');
console.log('  Slice:', slice.toString());
console.log('  Original:', original.toString());
console.log('  Both changed! 😮\n');

console.log('To create independent copy, use Buffer.from():\n');

const original2 = Buffer.from('Hello World!');
const copy = Buffer.from(original2.slice(0, 5));

copy[0] = 89;
console.log('After modifying copy:');
console.log('  Copy:', copy.toString());
console.log('  Original:', original2.toString());
console.log('  Only copy changed ✅\n');

// ========================================
// Part 4: Copying Buffers
// ========================================

console.log('=== 4. Copying Buffers ===\n');

const source = Buffer.from('Copy me!');
const dest = Buffer.alloc(20);

console.log('Source:', source.toString());
console.log('Dest before:', dest);
console.log('');

// Copy from source to dest
source.copy(dest, 0, 0, 8);

console.log('After copy:');
console.log('  Dest:', dest);
console.log('  As string:', dest.toString().trim());
console.log('');

// Copy to different offset
source.copy(dest, 10);

console.log('After copying to offset 10:');
console.log('  Dest:', dest.toString('utf8', 0, 20));
console.log('');

// ========================================
// Part 5: Comparing Buffers
// ========================================

console.log('=== 5. Comparing Buffers ===\n');

const buf1 = Buffer.from('abc');
const buf2 = Buffer.from('abc');
const buf3 = Buffer.from('abd');

console.log('buf1:', buf1.toString());
console.log('buf2:', buf2.toString());
console.log('buf3:', buf3.toString());
console.log('');

console.log('🔹 Equality Check\n');

console.log('buf1 === buf2:', buf1 === buf2, '(different objects)');
console.log('buf1.equals(buf2):', buf1.equals(buf2), '(same content)');
console.log('buf1.equals(buf3):', buf1.equals(buf3), '(different content)');
console.log('');

console.log('🔹 Comparison (Sorting)\n');

console.log('buf1.compare(buf2):', buf1.compare(buf2), '(0 = equal)');
console.log('buf1.compare(buf3):', buf1.compare(buf3), '(-1 = buf1 < buf3)');
console.log('buf3.compare(buf1):', buf3.compare(buf1), '(1 = buf3 > buf1)');
console.log('');

// Sorting buffers
const buffers = [
  Buffer.from('def'),
  Buffer.from('abc'),
  Buffer.from('xyz'),
  Buffer.from('bcd')
];

console.log('Before sort:', buffers.map(b => b.toString()));

buffers.sort((a, b) => a.compare(b));

console.log('After sort:', buffers.map(b => b.toString()));
console.log('');

// ========================================
// Part 6: Concatenating Buffers
// ========================================

console.log('=== 6. Concatenating Buffers ===\n');

const buf4 = Buffer.from('Hello ');
const buf5 = Buffer.from('World');
const buf6 = Buffer.from('!');

console.log('buf4:', buf4.toString());
console.log('buf5:', buf5.toString());
console.log('buf6:', buf6.toString());
console.log('');

const combined = Buffer.concat([buf4, buf5, buf6]);

console.log('Combined:', combined.toString());
console.log('Total length:', combined.length, 'bytes');
console.log('');

// Concat with total length hint (optimization)
const combined2 = Buffer.concat([buf4, buf5, buf6], 20);
console.log('Combined with length hint:', combined2);
console.log('Length:', combined2.length);
console.log('');

// ========================================
// Part 7: Searching in Buffers
// ========================================

console.log('=== 7. Searching in Buffers ===\n');

const searchBuf = Buffer.from('Hello World! Hello Universe!');

console.log('Buffer:', searchBuf.toString());
console.log('');

console.log('🔹 indexOf\n');

const pos1 = searchBuf.indexOf('World');
console.log('indexOf("World"):', pos1);
console.log('Found at:', searchBuf.toString('utf8', pos1, pos1 + 5));
console.log('');

const pos2 = searchBuf.indexOf('Hello', 1); // Start from position 1
console.log('indexOf("Hello", 1):', pos2, '(second occurrence)');
console.log('');

console.log('🔹 lastIndexOf\n');

const pos3 = searchBuf.lastIndexOf('Hello');
console.log('lastIndexOf("Hello"):', pos3, '(last occurrence)');
console.log('');

console.log('🔹 includes\n');

console.log('includes("World"):', searchBuf.includes('World'));
console.log('includes("Mars"):', searchBuf.includes('Mars'));
console.log('');

// ========================================
// Part 8: Filling Buffers
// ========================================

console.log('=== 8. Filling Buffers ===\n');

console.log('🔹 Fill with Single Value\n');

const fillBuf1 = Buffer.alloc(10);
fillBuf1.fill(65); // Fill with 'A' (ASCII 65)

console.log('Filled with 65:', fillBuf1);
console.log('As string:', fillBuf1.toString());
console.log('');

console.log('🔹 Fill with String\n');

const fillBuf2 = Buffer.alloc(15);
fillBuf2.fill('abc');

console.log('Filled with "abc":', fillBuf2.toString());
console.log('');

console.log('🔹 Fill Portion\n');

const fillBuf3 = Buffer.alloc(10);
fillBuf3.fill('X', 2, 8); // Fill positions 2-7 with 'X'

console.log('Filled positions 2-7:', fillBuf3);
console.log('As string:', fillBuf3.toString());
console.log('');

// ========================================
// Part 9: Endianness (Byte Order)
// ========================================

console.log('=== 9. Endianness (Byte Order) ===\n');

console.log('What is endianness?');
console.log('  How multi-byte numbers are stored in memory\n');

const num = 0x12345678;
console.log('Number:', '0x' + num.toString(16), '(', num, ')');
console.log('');

const leBuf = Buffer.allocUnsafe(4);
const beBuf = Buffer.allocUnsafe(4);

leBuf.writeUInt32LE(num, 0);
beBuf.writeUInt32BE(num, 0);

console.log('Little-Endian (LE):');
console.log('  Buffer:', leBuf);
console.log('  Hex:', leBuf.toString('hex'));
console.log('  Bytes: [78, 56, 34, 12] - least significant byte first');
console.log('');

console.log('Big-Endian (BE):');
console.log('  Buffer:', beBuf);
console.log('  Hex:', beBuf.toString('hex'));
console.log('  Bytes: [12, 34, 56, 78] - most significant byte first');
console.log('');

console.log('When to use:');
console.log('  • LE: x86/x64 CPUs (Intel/AMD), most modern systems');
console.log('  • BE: Network protocols, some file formats');
console.log('  • Always specify when working with binary protocols!');
console.log('');

// ========================================
// Part 10: Swapping Byte Order
// ========================================

console.log('=== 10. Swapping Byte Order ===\n');

const swap16Buf = Buffer.from([0x01, 0x02, 0x03, 0x04]);
console.log('Original:', swap16Buf);
console.log('Hex:', swap16Buf.toString('hex'));

swap16Buf.swap16();
console.log('After swap16():', swap16Buf);
console.log('Hex:', swap16Buf.toString('hex'));
console.log('(Swaps every 2 bytes: 0102 → 0201, 0304 → 0403)');
console.log('');

const swap32Buf = Buffer.from([0x01, 0x02, 0x03, 0x04]);
swap32Buf.swap32();
console.log('After swap32():', swap32Buf);
console.log('Hex:', swap32Buf.toString('hex'));
console.log('(Swaps every 4 bytes: 01020304 → 04030201)');
console.log('');

// ========================================
// Summary
// ========================================

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📝 Buffer Operations Summary');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('✅ Reading:');
console.log('   • buf[i] - read byte');
console.log('   • buf.readInt8/16/32() - read integers');
console.log('   • buf.readFloat/Double() - read floats\n');

console.log('✅ Writing:');
console.log('   • buf[i] = value - write byte');
console.log('   • buf.write(string) - write string');
console.log('   • buf.writeInt8/16/32() - write integers\n');

console.log('✅ Manipulation:');
console.log('   • buf.slice() - create view (shares memory!)');
console.log('   • buf.copy() - copy to another buffer');
console.log('   • Buffer.concat() - join buffers\n');

console.log('✅ Comparison:');
console.log('   • buf.equals() - check equality');
console.log('   • buf.compare() - lexicographic comparison\n');

console.log('✅ Searching:');
console.log('   • buf.indexOf() - find first occurrence');
console.log('   • buf.lastIndexOf() - find last occurrence');
console.log('   • buf.includes() - check if contains\n');

console.log('✅ Filling:');
console.log('   • buf.fill(value) - fill with value\n');

console.log('✅ Endianness:');
console.log('   • LE (Little-Endian) - x86/x64 systems');
console.log('   • BE (Big-Endian) - network protocols');
console.log('   • Always specify for binary data!\n');

console.log('Next: Working with binary data and protocols! →\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
