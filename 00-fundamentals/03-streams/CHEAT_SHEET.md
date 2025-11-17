# Node.js Streams Cheat Sheet

Quick reference for working with streams in Node.js.

## Stream Types

```javascript
const {
  Readable,
  Writable,
  Duplex,
  Transform,
  pipeline,
  finished,
} = require("stream");
```

---

## Readable Streams

### Create Readable Stream

```javascript
// From file
const fs = require("fs");
const readable = fs.createReadStream("file.txt", {
  encoding: "utf8", // Optional: decode to string
  highWaterMark: 64 * 1024, // Buffer size (default: 64KB)
  start: 0, // Start byte position
  end: 99, // End byte position
});
```

```javascript
// Custom readable
class MyReadable extends Readable {
  _read(size) {
    // Push data or null (end)
    this.push(data);
    this.push(null); // End stream
  }
}
```

```javascript
// From iterable (Node 12+)
const { Readable } = require("stream");
const readable = Readable.from(["hello", "world"]);
```

### Reading Modes

#### Flowing Mode (Automatic)

```javascript
readable.on("data", (chunk) => {
  console.log("Received:", chunk);
});

readable.on("end", () => {
  console.log("No more data");
});
```

#### Paused Mode (Manual)

```javascript
readable.on("readable", () => {
  let chunk;
  while ((chunk = readable.read()) !== null) {
    console.log("Received:", chunk);
  }
});
```

#### Async Iteration (Modern)

```javascript
for await (const chunk of readable) {
  console.log("Received:", chunk);
}
```

### Control Methods

```javascript
readable.pause(); // Pause flowing
readable.resume(); // Resume flowing
readable.read(size); // Manually read chunk
readable.unshift(chunk); // Put chunk back
readable.pipe(dest); // Pipe to writable
readable.unpipe(dest); // Unpipe
```

### Events

```javascript
readable.on("data", (chunk) => {}); // Flowing mode
readable.on("readable", () => {}); // Paused mode
readable.on("end", () => {}); // No more data
readable.on("error", (err) => {}); // Error occurred
readable.on("close", () => {}); // Stream closed
readable.on("pause", () => {}); // Stream paused
readable.on("resume", () => {}); // Stream resumed
```

### Properties

```javascript
readable.readable; // true if safe to read
readable.readableEnded; // true if 'end' emitted
readable.readableFlowing; // null, true, or false
readable.readableHighWaterMark; // Buffer size limit
readable.readableLength; // Bytes in buffer
```

---

## Writable Streams

### Create Writable Stream

```javascript
// To file
const writable = fs.createWriteStream("output.txt", {
  encoding: "utf8",
  highWaterMark: 16 * 1024, // Buffer size (default: 16KB)
  flags: "w", // 'w' write, 'a' append
  mode: 0o666, // File permissions
});
```

```javascript
// Custom writable
class MyWritable extends Writable {
  _write(chunk, encoding, callback) {
    // Process chunk
    // Call callback when done
    callback();
  }

  _final(callback) {
    // Called when stream ending
    callback();
  }
}
```

### Writing Data

```javascript
// Write returns boolean
const ok = writable.write("data");
if (!ok) {
  // Buffer full, wait for drain
  writable.once("drain", () => {
    // Can write more now
  });
}

// Signal end
writable.end("final data");

// Or with callback
writable.end("final data", () => {
  console.log("All data written");
});
```

### Backpressure Handling

```javascript
function writeMore() {
  let ok = true;
  while (hasMore() && ok) {
    const data = getData();
    ok = writable.write(data);
  }

  if (hasMore()) {
    // Buffer full, wait for drain
    writable.once("drain", writeMore);
  } else {
    writable.end();
  }
}
```

### Cork/Uncork (Optimization)

```javascript
writable.cork(); // Buffer writes
writable.write("chunk 1");
writable.write("chunk 2");
writable.uncork(); // Flush all at once
```

### Events

```javascript
writable.on("drain", () => {}); // Ready for more data
writable.on("finish", () => {}); // All data written
writable.on("pipe", (src) => {}); // Piped from readable
writable.on("unpipe", (src) => {}); // Unpiped
writable.on("error", (err) => {}); // Error occurred
writable.on("close", () => {}); // Stream closed
```

### Properties

```javascript
writable.writable; // true if safe to write
writable.writableEnded; // true if end() called
writable.writableFinished; // true if 'finish' emitted
writable.writableHighWaterMark; // Buffer size limit
writable.writableLength; // Bytes in buffer
writable.writableNeedDrain; // true if should wait
```

---

## Transform Streams

### Create Transform

```javascript
class MyTransform extends Transform {
  constructor(options) {
    super(options);
  }

  _transform(chunk, encoding, callback) {
    // Modify chunk
    const modified = doSomething(chunk);
    this.push(modified);
    callback();
  }

  _flush(callback) {
    // Optional: output final data
    this.push("final");
    callback();
  }
}
```

### Object Mode

```javascript
const transform = new Transform({
  objectMode: true, // Work with objects instead of buffers
  transform(obj, encoding, callback) {
    // Modify object
    this.push(modifiedObj);
    callback();
  },
});
```

### Built-in Transforms

```javascript
const zlib = require("zlib");
const crypto = require("crypto");

// Compression
zlib.createGzip();
zlib.createGunzip();
zlib.createDeflate();
zlib.createInflate();

// Hashing
crypto.createHash("sha256");

// Encryption
crypto.createCipheriv(algorithm, key, iv);
crypto.createDecipheriv(algorithm, key, iv);
```

---

## Piping Streams

### Basic Piping

```javascript
// Simple pipe
readable.pipe(writable);

// Chain transforms
readable.pipe(transform1).pipe(transform2).pipe(writable);

// Pipe to multiple destinations
readable.pipe(dest1);
readable.pipe(dest2);
```

### Pipe Options

```javascript
readable.pipe(writable, {
  end: true, // Auto-end destination (default: true)
});

// Keep destination open
readable.pipe(writable, { end: false });
readable.on("end", () => {
  writable.write("more data after first readable");
  writable.end();
});
```

---

## Pipeline Function (RECOMMENDED!)

### Basic Usage

```javascript
const { pipeline } = require("stream");

pipeline(readable, transform, writable, (err) => {
  if (err) {
    console.error("Pipeline failed:", err);
  } else {
    console.log("Pipeline succeeded");
  }
});
```

### Promise-based

```javascript
const { promisify } = require("util");
const pipeline = promisify(require("stream").pipeline);

async function run() {
  try {
    await pipeline(readable, transform, writable);
    console.log("Success!");
  } catch (err) {
    console.error("Failed:", err);
  }
}
```

### Multiple Transforms

```javascript
await pipeline(
  fs.createReadStream("input.txt"),
  transform1,
  transform2,
  transform3,
  fs.createWriteStream("output.txt")
);
```

---

## Error Handling

### With .pipe()

```javascript
// MUST handle errors on EACH stream
readable.on("error", handleError);
transform.on("error", handleError);
writable.on("error", handleError);

readable.pipe(transform).pipe(writable);
```

### With pipeline() (Better!)

```javascript
// Single error handler
pipeline(readable, transform, writable, (err) => {
  if (err) {
    // All errors caught here
    // All streams auto-cleaned up
  }
});
```

### Custom Error Handling

```javascript
class SafeTransform extends Transform {
  _transform(chunk, encoding, callback) {
    try {
      const result = riskyOperation(chunk);
      callback(null, result);
    } catch (err) {
      callback(err); // Pass error to pipeline
    }
  }
}
```

---

## Stream Helpers

### finished()

```javascript
const { finished } = require("stream");

finished(stream, (err) => {
  if (err) {
    console.error("Stream failed:", err);
  } else {
    console.log("Stream completed");
  }
});

// Promise-based
const finished = promisify(require("stream").finished);
await finished(stream);
```

### Destroy Stream

```javascript
stream.destroy(); // Clean up immediately
stream.destroy(new Error("Reason")); // With error
```

### AbortController (Node 15+)

```javascript
const controller = new AbortController();
const { signal } = controller;

pipeline(
  fs.createReadStream("input.txt", { signal }),
  transform,
  fs.createWriteStream("output.txt", { signal }),
  (err) => {
    if (err) console.error(err);
  }
);

// Abort all streams
setTimeout(() => controller.abort(), 1000);
```

---

## Common Patterns

### Line-by-Line Processing

```javascript
const readline = require("readline");

const rl = readline.createInterface({
  input: fs.createReadStream("file.txt"),
  crlfDelay: Infinity,
});

rl.on("line", (line) => {
  console.log("Line:", line);
});
```

### Filter Transform

```javascript
class Filter extends Transform {
  constructor(filterFn, options) {
    super({ ...options, objectMode: true });
    this.filterFn = filterFn;
  }

  _transform(obj, encoding, callback) {
    if (this.filterFn(obj)) {
      this.push(obj);
    }
    callback();
  }
}
```

### Map Transform

```javascript
class Map extends Transform {
  constructor(mapFn, options) {
    super({ ...options, objectMode: true });
    this.mapFn = mapFn;
  }

  _transform(obj, encoding, callback) {
    this.push(this.mapFn(obj));
    callback();
  }
}
```

---

## Performance Tips

### Buffer Sizes

```javascript
// Large files - bigger buffers
const stream = fs.createReadStream("huge.txt", {
  highWaterMark: 256 * 1024, // 256KB
});

// Many small writes - smaller buffers
const stream = fs.createWriteStream("output.txt", {
  highWaterMark: 8 * 1024, // 8KB
});
```

### Object Mode Overhead

```javascript
// Buffer mode (faster)
const fast = new Transform({
  transform(chunk, encoding, callback) {
    // chunk is Buffer
    callback(null, chunk);
  },
});

// Object mode (slower but convenient)
const convenient = new Transform({
  objectMode: true,
  transform(obj, encoding, callback) {
    // obj is JavaScript object
    callback(null, obj);
  },
});
```

---

## Debugging

### Monitor Memory

```javascript
setInterval(() => {
  const usage = process.memoryUsage();
  console.log({
    rss: Math.round(usage.rss / 1024 / 1024) + "MB",
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + "MB",
  });
}, 1000);
```

### Track Backpressure

```javascript
const ok = writable.write(data);
console.log({
  ok,
  needDrain: writable.writableNeedDrain,
  bufferSize: writable.writableLength,
  highWaterMark: writable.writableHighWaterMark,
});
```

### Log Stream Events

```javascript
function debugStream(stream, name) {
  ["data", "end", "error", "close", "drain", "finish"].forEach((event) => {
    stream.on(event, (...args) => {
      console.log(`[${name}] ${event}`, args);
    });
  });
}
```

---

## Quick Checklist

When working with streams:

- [ ] Use `pipeline()` instead of `.pipe()`
- [ ] Always handle errors
- [ ] Check `write()` return value (backpressure)
- [ ] Wait for `drain` event if write returns false
- [ ] Use appropriate buffer sizes (`highWaterMark`)
- [ ] Test with large files
- [ ] Monitor memory usage
- [ ] Clean up with `destroy()` on errors
- [ ] Use object mode only when needed
- [ ] Prefer async iteration for simple cases

---

## Common Mistakes

❌ Buffering entire file

```javascript
const data = fs.readFileSync("huge.txt"); // BAD
```

✅ Streaming

```javascript
fs.createReadStream("huge.txt").pipe(process.stdout); // GOOD
```

---

❌ Ignoring backpressure

```javascript
for (let i = 0; i < 1000000; i++) {
  stream.write(data); // BAD - can overflow
}
```

✅ Handling backpressure

```javascript
function write() {
  let ok = true;
  while (i < 1000000 && ok) {
    ok = stream.write(data);
    i++;
  }
  if (i < 1000000) stream.once("drain", write);
}
```

---

❌ No error handling

```javascript
readable.pipe(writable); // BAD - errors crash app
```

✅ With error handling

```javascript
pipeline(readable, writable, (err) => {
  if (err) console.error(err); // GOOD
});
```

---

This cheat sheet covers the most important stream APIs and patterns. Keep it handy!
