# Buffer Cheat Sheet

Quick reference for Node.js Buffer API.

## Creation

```javascript
// Allocate and zero (safe)
Buffer.alloc(size)
Buffer.alloc(size, fill)
Buffer.alloc(size, fill, encoding)

// Allocate (fast, unsafe - contains old memory)
Buffer.allocUnsafe(size)
Buffer.allocUnsafeSlow(size)

// From string
Buffer.from(string)
Buffer.from(string, encoding)

// From array
Buffer.from([byte1, byte2, ...])

// From ArrayBuffer
Buffer.from(arrayBuffer)
Buffer.from(arrayBuffer, offset, length)

// From another buffer (copies)
Buffer.from(buffer)

// Pool size (default 8KB)
Buffer.poolSize
```

## Properties

```javascript
buf.length; // Size in bytes
buf.buffer; // Underlying ArrayBuffer
buf.byteOffset; // Offset in ArrayBuffer
Buffer.isBuffer(obj); // Check if buffer
Buffer.isEncoding(enc); // Check if valid encoding
```

## Reading Integers

```javascript
// Unsigned
buf.readUInt8(offset);
buf.readUInt16BE(offset); // Big-endian
buf.readUInt16LE(offset); // Little-endian
buf.readUInt32BE(offset);
buf.readUInt32LE(offset);
buf.readBigUInt64BE(offset); // Returns BigInt
buf.readBigUInt64LE(offset);

// Signed
buf.readInt8(offset);
buf.readInt16BE(offset);
buf.readInt16LE(offset);
buf.readInt32BE(offset);
buf.readInt32LE(offset);
buf.readBigInt64BE(offset);
buf.readBigInt64LE(offset);

// Variable length
buf.readUIntBE(offset, byteLength);
buf.readUIntLE(offset, byteLength);
buf.readIntBE(offset, byteLength);
buf.readIntLE(offset, byteLength);
```

## Reading Floats

```javascript
buf.readFloatBE(offset); // 32-bit float
buf.readFloatLE(offset);
buf.readDoubleBE(offset); // 64-bit float
buf.readDoubleLE(offset);
```

## Writing Integers

```javascript
// Unsigned
buf.writeUInt8(value, offset);
buf.writeUInt16BE(value, offset);
buf.writeUInt16LE(value, offset);
buf.writeUInt32BE(value, offset);
buf.writeUInt32LE(value, offset);
buf.writeBigUInt64BE(value, offset);
buf.writeBigUInt64LE(value, offset);

// Signed
buf.writeInt8(value, offset);
buf.writeInt16BE(value, offset);
buf.writeInt16LE(value, offset);
buf.writeInt32BE(value, offset);
buf.writeInt32LE(value, offset);
buf.writeBigInt64BE(value, offset);
buf.writeBigInt64LE(value, offset);

// Variable length
buf.writeUIntBE(value, offset, byteLength);
buf.writeUIntLE(value, offset, byteLength);
buf.writeIntBE(value, offset, byteLength);
buf.writeIntLE(value, offset, byteLength);
```

## Writing Floats

```javascript
buf.writeFloatBE(value, offset);
buf.writeFloatLE(value, offset);
buf.writeDoubleBE(value, offset);
buf.writeDoubleLE(value, offset);
```

## String Operations

```javascript
// Convert to string
buf.toString();
buf.toString(encoding);
buf.toString(encoding, start, end);

// Write string
buf.write(string);
buf.write(string, offset);
buf.write(string, offset, length);
buf.write(string, offset, length, encoding);

// Get byte length of string
Buffer.byteLength(string);
Buffer.byteLength(string, encoding);
```

## Manipulation

```javascript
// Slice (creates view - shares memory!)
buf.slice();
buf.slice(start);
buf.slice(start, end);
buf.subarray(start, end); // Alias for slice

// Copy
buf.copy(target);
buf.copy(target, targetStart);
buf.copy(target, targetStart, sourceStart);
buf.copy(target, targetStart, sourceStart, sourceEnd);

// Concatenate
Buffer.concat(list);
Buffer.concat(list, totalLength);

// Fill
buf.fill(value);
buf.fill(value, offset);
buf.fill(value, offset, end);
buf.fill(value, offset, end, encoding);

// Byte swapping
buf.swap16(); // Swap every 16 bits
buf.swap32(); // Swap every 32 bits
buf.swap64(); // Swap every 64 bits
```

## Comparison & Search

```javascript
// Compare
buf.equals(otherBuffer);
buf.compare(otherBuffer);
buf.compare(target, targetStart, targetEnd, sourceStart, sourceEnd);
Buffer.compare(buf1, buf2);

// Search
buf.indexOf(value);
buf.indexOf(value, byteOffset);
buf.indexOf(value, byteOffset, encoding);
buf.lastIndexOf(value);
buf.lastIndexOf(value, byteOffset);
buf.includes(value);
buf.includes(value, byteOffset);
buf.includes(value, byteOffset, encoding);
```

## Iteration

```javascript
// For-of
for (const byte of buffer) {
  console.log(byte);
}

// Array-like access
buffer[0]; // Read byte
buffer[0] = 255; // Write byte

// Iterator methods
buffer.entries();
buffer.keys();
buffer.values();
```

## JSON

```javascript
// Convert to JSON (array of bytes)
buf.toJSON();
// { type: 'Buffer', data: [72, 101, 108, 108, 111] }

// From JSON
Buffer.from(json.data);
```

## Encodings

```javascript
"utf8"; // UTF-8 (default)
"utf16le"; // UTF-16 Little-Endian
"ucs2"; // Alias for utf16le
"latin1"; // ISO-8859-1
"binary"; // Alias for latin1 (deprecated)
"ascii"; // 7-bit ASCII
"hex"; // Hexadecimal string
"base64"; // Base64 encoding
"base64url"; // URL-safe Base64
```

## Common Patterns

### Creating from hex

```javascript
Buffer.from("48656c6c6f", "hex");
```

### Creating from base64

```javascript
Buffer.from("SGVsbG8=", "base64");
```

### Converting between encodings

```javascript
Buffer.from(str, "utf8").toString("hex");
Buffer.from(hex, "hex").toString("utf8");
Buffer.from(str, "utf8").toString("base64");
Buffer.from(b64, "base64").toString("utf8");
```

### Safe allocation

```javascript
const buf = Buffer.alloc(size);
// or
const buf = Buffer.allocUnsafe(size).fill(0);
```

### Deep copy

```javascript
const copy = Buffer.from(original);
// or
const copy = Buffer.allocUnsafe(original.length);
original.copy(copy);
```

### Concatenating buffers

```javascript
const combined = Buffer.concat([buf1, buf2, buf3]);
```

### Reading multi-byte values

```javascript
// Network byte order (big-endian)
const value = buf.readUInt32BE(0);

// x86 byte order (little-endian)
const value = buf.readUInt32LE(0);
```

### Writing multi-byte values

```javascript
buf.writeUInt32BE(value, 0); // Network
buf.writeUInt32LE(value, 0); // x86
```

## Integer Ranges

| Type      | Bytes | Min            | Max           |
| --------- | ----- | -------------- | ------------- |
| UInt8     | 1     | 0              | 255           |
| Int8      | 1     | -128           | 127           |
| UInt16    | 2     | 0              | 65,535        |
| Int16     | 2     | -32,768        | 32,767        |
| UInt32    | 4     | 0              | 4,294,967,295 |
| Int32     | 4     | -2,147,483,648 | 2,147,483,647 |
| BigUInt64 | 8     | 0              | 2^64 - 1      |
| BigInt64  | 8     | -2^63          | 2^63 - 1      |

## Float Precision

| Type   | Bytes | Precision          |
| ------ | ----- | ------------------ |
| Float  | 4     | ~7 decimal digits  |
| Double | 8     | ~15 decimal digits |

## Endianness

```javascript
// Big-Endian (BE): Most significant byte first
// 0x12345678 → [12 34 56 78]
// Used by: Network protocols, most file formats

// Little-Endian (LE): Least significant byte first
// 0x12345678 → [78 56 34 12]
// Used by: x86/x64 CPUs, ARM (usually), Windows
```

## Performance Tips

```javascript
// ✅ Fast: Pre-allocate and reuse
const buf = Buffer.allocUnsafe(1024);

// ❌ Slow: Creating many small buffers
for (let i = 0; i < 1000; i++) {
  const buf = Buffer.from("data");
}

// ✅ Fast: Use views instead of copying
const view = buf.slice(0, 100);

// ❌ Slow: Copying unnecessarily
const copy = Buffer.allocUnsafe(100);
buf.copy(copy, 0, 0, 100);

// ✅ Fast: Batch writes
buf.writeUInt32BE(value1, 0);
buf.writeUInt32BE(value2, 4);

// ❌ Slow: Multiple concatenations
let result = Buffer.alloc(0);
for (const chunk of chunks) {
  result = Buffer.concat([result, chunk]);
}
```

## Common Gotchas

```javascript
// ⚠️ Slices share memory
const buf1 = Buffer.from("Hello");
const buf2 = buf1.slice(0, 3);
buf2[0] = 0x4a;
console.log(buf1.toString()); // "Jello"

// ⚠️ allocUnsafe has old data
const buf = Buffer.allocUnsafe(10);
console.log(buf); // Random bytes!

// ⚠️ Out of bounds writes are ignored
const buf = Buffer.alloc(5);
buf[10] = 42; // Silent fail
console.log(buf[10]); // undefined

// ⚠️ Encoding matters
const buf = Buffer.from("café");
buf.length; // 5 (not 4!)

// ⚠️ toString() returns UTF-8 by default
const buf = Buffer.from([0xff, 0xff]);
buf.toString(); // "ÿÿ"
buf.toString("hex"); // "ffff"
```

## Memory Layout

```javascript
const buf = Buffer.from("Hello");

// Visual representation:
// Index:  [0]  [1]  [2]  [3]  [4]
// Hex:    0x48 0x65 0x6c 0x6c 0x6f
// Dec:    72   101  108  108  111
// Char:   'H'  'e'  'l'  'l'  'o'
```

## Debugging

```javascript
// Inspect as hex dump
console.log(buf);
// <Buffer 48 65 6c 6c 6f>

// Inspect individual bytes
for (let i = 0; i < buf.length; i++) {
  console.log(`[${i}] = 0x${buf[i].toString(16).padStart(2, "0")}`);
}

// View as different encodings
console.log("UTF-8:", buf.toString("utf8"));
console.log("Hex:", buf.toString("hex"));
console.log("Base64:", buf.toString("base64"));

// Inspect structure
console.log("Length:", buf.length);
console.log("JSON:", buf.toJSON());
```

## When to Use What

```javascript
// Known data, need safety
Buffer.from("text");
Buffer.from([1, 2, 3]);

// Fixed size, need zeros
Buffer.alloc(size);

// Fixed size, will write all bytes
Buffer.allocUnsafe(size);

// Combining buffers
Buffer.concat(buffers);

// Viewing portion
buffer.slice(start, end);

// Copying portion
const copy = Buffer.allocUnsafe(length);
buffer.copy(copy, 0, start, end);
```

## Quick Conversions

```javascript
// String → Buffer
Buffer.from(str, 'utf8')

// Buffer → String
buf.toString('utf8')

// Hex String → Buffer
Buffer.from(hexStr, 'hex')

// Buffer → Hex String
buf.toString('hex')

// Base64 → Buffer
Buffer.from(b64Str, 'base64')

// Buffer → Base64
buf.toString('base64')

// Array → Buffer
Buffer.from(array)

// Buffer → Array
Array.from(buf)
// or
[...buf]

// Number → Buffer
const buf = Buffer.allocUnsafe(4);
buf.writeUInt32BE(num, 0);

// Buffer → Number
const num = buf.readUInt32BE(0);
```

## TypedArray Interop

```javascript
// Buffer → TypedArray
const uint8 = new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
const uint16 = new Uint16Array(buf.buffer, buf.byteOffset, buf.length / 2);

// TypedArray → Buffer
const buf = Buffer.from(uint8.buffer, uint8.byteOffset, uint8.byteLength);
```

---

**Note**: This cheat sheet covers Buffer API as of Node.js v18+. Always check [official docs](https://nodejs.org/api/buffer.html) for the latest API.
