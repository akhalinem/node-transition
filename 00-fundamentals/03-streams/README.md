# Streams - Efficient Data Processing

**Time Required**: 4-6 hours  
**Difficulty**: ⭐⭐⭐⭐  
**Importance**: 🔥🔥🔥🔥

## Overview

Streams are one of the most powerful concepts in Node.js. They allow you to process data piece by piece without loading everything into memory. This is essential for building scalable applications that handle large files, network requests, and real-time data.

## Why Streams Matter

✅ **Memory Efficiency** - Process GB files with MB of memory  
✅ **Time Efficiency** - Start processing immediately  
✅ **Composability** - Chain operations with `.pipe()`  
✅ **Backpressure** - Automatic flow control  
✅ **Real-world** - Used everywhere in Node.js (HTTP, files, etc.)

## Learning Path

### 1. Understand the Concepts (30 min)

Start with the introduction:

```bash
node examples/01-streams-intro.js
```

This covers:

- What are streams?
- Four types of streams
- Why use streams?
- When to use streams

### 2. Readable Streams (45 min)

Learn how to read data:

```bash
node examples/02-readable-streams.js
```

Topics:

- Flowing vs Paused mode
- Stream events
- Custom readable streams
- Async iteration
- File reading

### 3. Writable Streams (45 min)

Learn how to write data:

```bash
node examples/03-writable-streams.js
```

Topics:

- Writing to files
- Backpressure basics
- Custom writable streams
- Cork and uncork
- Stream lifecycle

### 4. Piping Streams (45 min)

Connect streams together:

```bash
node examples/04-piping-streams.js
```

Topics:

- Basic piping
- Chaining transforms
- pipeline() function (recommended!)
- Error handling
- Pipe options

### 5. Transform Streams (60 min)

Modify data in transit:

```bash
node examples/05-transform-streams.js
```

Topics:

- Creating transforms
- Object mode
- Built-in transforms (zlib, crypto)
- Complex pipelines
- Filter and map patterns

### 6. Backpressure (45 min)

Master flow control:

```bash
node examples/06-backpressure.js
```

Topics:

- What is backpressure?
- How it works
- Handling it correctly
- Monitoring buffer state
- Automatic handling with pipe()

### 7. Error Handling (45 min)

Handle failures gracefully:

```bash
node examples/07-error-handling.js
```

Topics:

- Common stream errors
- Error events
- pipeline() for centralized handling
- Error recovery strategies
- Cleanup with destroy()

## Exercises

### Exercise 1: Log File Processor (⭐⭐)

Build a streaming log analyzer that:

- Reads large log files
- Filters by severity
- Counts occurrences
- Extracts errors

**Start here**: `exercises/exercise-1-log-processor.md`

### Exercise 2: CSV to JSON Transformer (⭐⭐⭐)

Create a streaming data transformer:

- Parse CSV files
- Validate rows
- Transform data
- Output JSON formats

**Start here**: `exercises/exercise-2-csv-transformer.md`

### Exercise 3: HTTP File Upload (⭐⭐⭐⭐)

Build a production-ready upload system:

- Stream uploads to disk
- Real-time progress
- Checksum validation
- Handle GB+ files

**Start here**: `exercises/exercise-3-file-upload.md`

## Quick Reference

See `CHEAT_SHEET.md` for a comprehensive API reference.

## Key Concepts

### Four Types of Streams

```
┌─────────────┬──────────────────┬─────────────────────────┐
│ Type        │ Direction        │ Examples                │
├─────────────┼──────────────────┼─────────────────────────┤
│ Readable    │ Source → You     │ Read file, HTTP request │
│ Writable    │ You → Destination│ Write file, HTTP respons│
│ Duplex      │ Both directions  │ TCP socket, WebSocket   │
│ Transform   │ Modify data      │ Compression, encryption │
└─────────────┴──────────────────┴─────────────────────────┘
```

### Stream Pipeline

```javascript
const { pipeline } = require("stream");

// RECOMMENDED: Use pipeline() for error handling
pipeline(
  fs.createReadStream("input.txt"),
  transformStream,
  fs.createWriteStream("output.txt"),
  (err) => {
    if (err) console.error("Pipeline failed", err);
    else console.log("Pipeline succeeded");
  }
);
```

### Backpressure Pattern

```javascript
// Correct backpressure handling
function write() {
  let ok = true;
  while (hasMore && ok) {
    ok = writableStream.write(data);
  }
  if (!ok) {
    writableStream.once("drain", write);
  }
}
```

## Common Pitfalls

❌ **Loading entire file into memory**

```javascript
// BAD
const data = fs.readFileSync("huge-file.txt");
process(data);
```

✅ **Using streams**

```javascript
// GOOD
fs.createReadStream("huge-file.txt").on("data", (chunk) => process(chunk));
```

---

❌ **Ignoring backpressure**

```javascript
// BAD
for (let i = 0; i < 1000000; i++) {
  stream.write(data); // Can cause memory overflow!
}
```

✅ **Respecting backpressure**

```javascript
// GOOD
function writeMore() {
  let ok = true;
  while (i < 1000000 && ok) {
    ok = stream.write(data);
    i++;
  }
  if (i < 1000000) {
    stream.once("drain", writeMore);
  }
}
```

---

❌ **Using .pipe() without error handling**

```javascript
// BAD - errors crash app!
readable.pipe(writable);
```

✅ **Using pipeline() with error handling**

```javascript
// GOOD
pipeline(readable, writable, (err) => {
  if (err) console.error("Failed", err);
});
```

## Real-World Use Cases

### 1. File Processing

```javascript
// Process 10GB log file with 50MB memory
fs.createReadStream("app.log")
  .pipe(parseLines())
  .pipe(filterErrors())
  .pipe(fs.createWriteStream("errors.log"));
```

### 2. HTTP Proxy

```javascript
// Proxy large file downloads
http.createServer((req, res) => {
  request(externalUrl).pipe(res);
});
```

### 3. Data Compression

```javascript
// Compress and upload
fs.createReadStream("data.json").pipe(zlib.createGzip()).pipe(uploadToS3());
```

### 4. Real-time Processing

```javascript
// Process live data feed
websocket.pipe(parseJSON()).pipe(validate()).pipe(saveToDatabase());
```

## Performance Tips

1. **Set appropriate highWaterMark** for your use case
2. **Use object mode** only when needed (slower)
3. **Implement \_transform efficiently** (avoid heavy computation)
4. **Test with large files** to verify memory usage
5. **Monitor with process.memoryUsage()**
6. **Always use pipeline()** over manual piping
7. **Cleanup resources** with destroy() on errors

## Testing Your Understanding

After completing the examples and exercises, you should be able to:

- [ ] Explain the difference between Readable and Writable streams
- [ ] Implement custom Transform streams
- [ ] Handle backpressure correctly
- [ ] Use pipeline() for error handling
- [ ] Process multi-GB files with minimal memory
- [ ] Debug stream issues with proper monitoring
- [ ] Choose when to use streams vs loading into memory

## Next Steps

After mastering streams, you'll be ready for:

- **HTTP & Express** - Streams are core to HTTP in Node.js
- **Database connections** - Many DB drivers use streams
- **Real-time systems** - WebSockets and event streams
- **File uploads** - Multipart/form-data streaming
- **Data pipelines** - ETL and data processing

## Resources

### Official Documentation

- [Node.js Stream API](https://nodejs.org/api/stream.html)
- [Stream Handbook](https://github.com/substack/stream-handbook)

### Articles

- [Backpressuring in Streams](https://nodejs.org/en/docs/guides/backpressuring-in-streams/)
- [Understanding Streams](https://nodesource.com/blog/understanding-streams-in-nodejs/)

### Videos

- [Stream into the Future](https://www.youtube.com/watch?v=aTEDCotcn20) by Matteo Collina

## Questions?

If you're stuck:

1. Review the relevant example file
2. Check the cheat sheet for API reference
3. Read the official Node.js docs
4. Test with small data first
5. Use `console.log()` to debug flow

Remember: Streams are challenging but incredibly powerful. Take your time with each concept!

Happy streaming! 🌊
