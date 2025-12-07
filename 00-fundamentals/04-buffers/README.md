# Buffers

**Duration**: Week 4  
**Difficulty**: ⭐⭐⭐

## Overview

Buffers are Node.js's way of handling binary data. Unlike JavaScript strings (which use UTF-16 encoding), buffers represent raw binary data directly in memory. They're essential for:

- Reading and writing files
- Network communication
- Working with binary protocols
- Image/video processing
- Cryptography
- Compression

Think of buffers as **fixed-size chunks of memory** outside the V8 heap, allocated by the operating system.

## Why Buffers Matter

JavaScript was originally designed for text in web browsers. But when Node.js brought JavaScript to servers, it needed to handle:

- Binary file formats (images, videos, PDFs)
- Network protocols (TCP, UDP, HTTP/2)
- Database protocols (MySQL, PostgreSQL)
- System calls and native APIs
- Streaming data

Strings are inefficient for binary data:

- UTF-16 encoding doubles memory usage
- Character encoding/decoding overhead
- Difficult to manipulate individual bytes
- Not designed for binary operations

Buffers solve this by providing **direct access to raw bytes**.

## Key Concepts

### 1. Fixed-Size Memory

```javascript
const buf = Buffer.alloc(10); // 10 bytes, fixed
buf.length; // 10
// Cannot grow or shrink!
```

Unlike arrays, buffers have a fixed size when created. This makes them efficient but requires planning.

### 2. Raw Bytes

```javascript
const buf = Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
buf.toString(); // "Hello"
buf[0]; // 72 (decimal for 0x48)
```

Each position holds a byte (0-255). Buffers don't "know" what the data represents - that's up to you.

### 3. Encodings

```javascript
// Same data, different encodings
const buf = Buffer.from("Hello");
buf.toString("utf8"); // "Hello"
buf.toString("hex"); // "48656c6c6f"
buf.toString("base64"); // "SGVsbG8="
```

Encodings are conversion formats between binary data and text.

### 4. Mutability

```javascript
const buf = Buffer.from("Hello");
buf[0] = 0x4a; // Change 'H' to 'J'
buf.toString(); // "Jello"
```

Unlike strings (immutable in JS), you can modify buffer contents.

### 5. Memory Allocation

```javascript
// Safe: zeros memory
Buffer.alloc(10); // <Buffer 00 00 00 00 00 00 00 00 00 00>

// Fast but unsafe: doesn't zero
Buffer.allocUnsafe(10); // <Buffer ?? ?? ?? ?? ?? ?? ?? ?? ?? ??>

// From existing data
Buffer.from("text");
Buffer.from([1, 2, 3]);
```

`alloc` is safer (zeros memory), `allocUnsafe` is faster but contains old memory.

## Learning Path

### Start Here: Basics

📖 **[01-buffer-basics.js](./examples/01-buffer-basics.js)**

- What buffers are and why they exist
- Creating buffers (alloc, allocUnsafe, from)
- Character encodings (UTF-8, hex, base64)
- Buffer properties and methods
- String vs buffer performance
- When to use buffers
- Common gotchas

**Time**: 30 minutes

### Next: Operations

📖 **[02-buffer-operations.js](./examples/02-buffer-operations.js)**

- Reading numbers (integers, floats)
- Writing numbers (8-bit, 16-bit, 32-bit)
- Slicing and copying
- Comparing and searching
- Filling and swapping
- Endianness (big-endian vs little-endian)
- Byte manipulation

**Time**: 45 minutes

### Then: Binary Protocols

📖 **[03-binary-protocols.js](./examples/03-binary-protocols.js)**

- File format headers (PNG, JPEG, PDF)
- Magic numbers
- Binary message formats
- IP address parsing (IPv4, IPv6)
- Checksum calculation
- Bit manipulation
- Struct packing/unpacking
- Base64 encoding/decoding

**Time**: 60 minutes

### Finally: Integration

📖 **[04-buffers-and-streams.js](./examples/04-buffers-and-streams.js)**

- Buffers as default stream chunks
- Encoding options in streams
- Transform streams for buffer processing
- Collecting stream data
- Buffer pooling and memory management
- Controlling chunk size (highWaterMark)
- Memory sharing and copying

**Time**: 45 minutes

## Practical Exercises

### Exercise 1: Binary Database Parser

📝 **[exercise-1-binary-parser.md](./exercises/exercise-1-binary-parser.md)**

Build a parser for a custom binary database format. Learn to:

- Read fixed-format headers
- Parse structured records
- Handle mixed data types
- Implement queries and updates

**Difficulty**: ⭐⭐⭐  
**Time**: 45-60 minutes

### Exercise 2: Image Metadata Extractor

📝 **[exercise-2-image-metadata.md](./exercises/exercise-2-image-metadata.md)**

Extract metadata from real image files (PNG, JPEG, GIF). Learn to:

- Identify file types by magic numbers
- Parse binary format specifications
- Handle different encodings
- Extract embedded data

**Difficulty**: ⭐⭐⭐⭐  
**Time**: 60-90 minutes

### Exercise 3: Binary Protocol Client/Server

📝 **[exercise-3-binary-protocol.md](./exercises/exercise-3-binary-protocol.md)**

Build a TCP client/server with custom binary protocol. Learn to:

- Design binary message formats
- Implement message framing
- Handle partial messages
- Build request/response systems

**Difficulty**: ⭐⭐⭐⭐  
**Time**: 60-90 minutes

## Quick Reference

### Creating Buffers

```javascript
// Allocate and zero
Buffer.alloc(10);

// Allocate (fast, unsafe)
Buffer.allocUnsafe(10);

// From string
Buffer.from("Hello", "utf8");

// From array
Buffer.from([72, 101, 108, 108, 111]);

// From buffer (copy)
Buffer.from(existingBuffer);
```

### Reading Data

```javascript
buf.toString(); // to string
buf.toString("hex"); // as hex
buf.readUInt8(0); // unsigned 8-bit
buf.readInt16BE(0); // signed 16-bit big-endian
buf.readInt32LE(0); // signed 32-bit little-endian
buf.readFloatBE(0); // float big-endian
buf.readDoubleBE(0); // double big-endian
```

### Writing Data

```javascript
buf.write("Hello", 0, "utf8");
buf.writeUInt8(255, 0);
buf.writeInt16BE(-100, 0);
buf.writeInt32LE(123456, 0);
buf.writeFloatBE(3.14, 0);
buf.writeDoubleBE(3.14159, 0);
```

### Manipulation

```javascript
buf.slice(0, 5); // view (shares memory)
buf.subarray(0, 5); // view (alias for slice)
buf1.copy(buf2, 0, 0, 10); // copy bytes
Buffer.concat([buf1, buf2]); // concatenate
buf.fill(0); // fill with value
buf.swap16(); // byte swap
```

### Comparison

```javascript
buf1.equals(buf2); // equality
buf1.compare(buf2); // comparison (-1, 0, 1)
buf.indexOf("pattern"); // search
buf.includes("pattern"); // contains
```

## Common Encodings

| Encoding  | Use Case             | Example                    |
| --------- | -------------------- | -------------------------- |
| `utf8`    | Text (default)       | "Hello" → `48 65 6c 6c 6f` |
| `ascii`   | ASCII text only      | "Hi" → `48 69`             |
| `utf16le` | Windows text         | "A" → `41 00`              |
| `hex`     | Hexadecimal strings  | "ff" → `ff`                |
| `base64`  | Data encoding        | "SGVsbG8=" → "Hello"       |
| `binary`  | Latin-1 (deprecated) | Legacy support             |

## Integer Types

| Method               | Bytes | Range                           | Signed |
| -------------------- | ----- | ------------------------------- | ------ |
| `readUInt8`          | 1     | 0 to 255                        | No     |
| `readInt8`           | 1     | -128 to 127                     | Yes    |
| `readUInt16BE/LE`    | 2     | 0 to 65,535                     | No     |
| `readInt16BE/LE`     | 2     | -32,768 to 32,767               | Yes    |
| `readUInt32BE/LE`    | 4     | 0 to 4,294,967,295              | No     |
| `readInt32BE/LE`     | 4     | -2,147,483,648 to 2,147,483,647 | Yes    |
| `readBigUInt64BE/LE` | 8     | 0 to 2^64-1                     | No     |
| `readBigInt64BE/LE`  | 8     | -2^63 to 2^63-1                 | Yes    |

## Endianness

**Big-Endian (BE)**: Most significant byte first (network byte order)

```
0x12345678 → [12 34 56 78]
```

**Little-Endian (LE)**: Least significant byte first (x86 CPUs)

```
0x12345678 → [78 56 34 12]
```

Most network protocols use **big-endian**. Most CPUs use **little-endian**.

## Memory Management

### Buffer Pooling

Node.js maintains an internal buffer pool for small allocations (<4KB):

```javascript
// Uses pool (fast)
Buffer.allocUnsafe(100);

// Doesn't use pool (if >4KB)
Buffer.allocUnsafe(8192);
```

### Memory Sharing

```javascript
const buf1 = Buffer.from("Hello");
const buf2 = buf1.slice(0, 3); // Shares memory!

buf2[0] = 0x4a;
buf1.toString(); // "Jello" - buf1 changed too!

// To avoid sharing:
const buf3 = Buffer.from(buf1);
```

### When to Use What

```javascript
// When you need to write all bytes
Buffer.allocUnsafe(size);

// When you need guaranteed zeros
Buffer.alloc(size);

// When you might have old data issues
Buffer.alloc(size);
```

## Performance Tips

1. **Reuse buffers** instead of creating new ones
2. **Use `allocUnsafe`** when you'll write all bytes
3. **Avoid `toString()`** in hot paths
4. **Use views** (`slice`) instead of copying
5. **Pool buffers** for small, short-lived data
6. **Use streams** for large data
7. **Choose right integer size** (don't use 32-bit for small numbers)

## Common Pitfalls

### 1. Mutable Slices

```javascript
const buf = Buffer.from("Hello");
const slice = buf.slice(0, 2);
slice[0] = 0x4a;
console.log(buf.toString()); // "Jello" - original changed!
```

### 2. Uninitialized Memory

```javascript
const buf = Buffer.allocUnsafe(10);
console.log(buf); // Contains old memory! ⚠️
```

### 3. Encoding Assumptions

```javascript
// Wrong: assumes UTF-8
const buf = Buffer.from("café");
buf.length; // 5 (é is 2 bytes in UTF-8)

// Right: specify encoding
const buf = Buffer.from("café", "utf8");
```

### 4. Index Out of Bounds

```javascript
const buf = Buffer.alloc(5);
buf[10] = 42; // Silently ignored! ⚠️
console.log(buf[10]); // undefined
```

### 5. Negative Offsets

```javascript
const buf = Buffer.alloc(10);
buf.slice(-3); // Last 3 bytes (like arrays)
buf.readInt8(-1); // Error! ❌
```

## Real-World Use Cases

### File Format Parsing

- Images (PNG, JPEG, GIF)
- Videos (MP4, AVI)
- Documents (PDF, DOCX)
- Archives (ZIP, TAR)

### Network Protocols

- HTTP/2 and HTTP/3
- WebSocket frames
- Database protocols (MySQL, PostgreSQL)
- Custom binary protocols

### Cryptography

- Hashing (SHA-256, MD5)
- Encryption (AES, RSA)
- Random data generation
- Digital signatures

### System Integration

- IPC (Inter-Process Communication)
- Native addons
- Hardware communication
- Binary data processing

## Testing Your Knowledge

After completing this module, you should be able to:

- [ ] Explain what buffers are and why they're needed
- [ ] Create buffers using different methods
- [ ] Read and write different data types
- [ ] Work with various encodings
- [ ] Parse binary file formats
- [ ] Handle endianness correctly
- [ ] Implement binary protocols
- [ ] Integrate buffers with streams
- [ ] Avoid common pitfalls
- [ ] Choose appropriate buffer operations for performance

## Next Steps

After mastering buffers, you're ready for:

1. **Events** - Event-driven programming patterns
2. **File System** - Reading/writing files with buffers
3. **Network** - TCP/UDP communication
4. **Crypto** - Hashing and encryption
5. **Child Processes** - Process communication

## Additional Resources

### Node.js Documentation

- [Buffer API Reference](https://nodejs.org/api/buffer.html)
- [Stream Buffer Interaction](https://nodejs.org/api/stream.html#buffering)

### Related Topics

- Character encodings (UTF-8, UTF-16)
- Endianness and byte order
- Binary file formats
- Network protocols
- Memory management

### Tools

- Hex editors (HxD, xxd)
- Network analysis (Wireshark, tcpdump)
- Binary diff tools

## Getting Help

If you're stuck:

1. **Check the examples** - Each concept is demonstrated
2. **Read the hints** - Exercises include helpful tips
3. **Review the cheat sheet** - Quick API reference
4. **Console.log the buffer** - Inspect the bytes
5. **Use hex editor** - Visualize binary data
6. **Test incrementally** - Build up complex operations

Remember: Working with binary data takes practice. Start with the basics and gradually build complexity!

---

**Ready to start?** Begin with [01-buffer-basics.js](./examples/01-buffer-basics.js)!
