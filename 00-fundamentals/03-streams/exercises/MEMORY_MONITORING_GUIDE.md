# Memory Monitoring in Node.js Streams

## Understanding Node.js Memory Metrics

### `process.memoryUsage()` Returns:

```javascript
{
  rss: 123456789,        // Resident Set Size
  heapTotal: 98765432,   // Total heap allocated
  heapUsed: 87654321,    // Heap actually used
  external: 1234567,     // C++ objects bound to JS
  arrayBuffers: 123456   // ArrayBuffer & SharedArrayBuffer
}
```

### What Each Metric Means:

#### 1. **RSS (Resident Set Size)**

- **Total memory** allocated for the process
- Includes: heap, code, stack, and shared libraries
- **This is what the OS reports** as process memory
- **Highest** number, most important for monitoring

```javascript
const rssMB = process.memoryUsage().rss / 1024 / 1024;
console.log(`Process using ${rssMB.toFixed(2)} MB`);
```

#### 2. **Heap Total**

- Total size of the **allocated heap**
- V8's memory pool for JavaScript objects
- Automatically grows/shrinks based on usage

#### 3. **Heap Used**

- **Active memory** being used for JS objects
- This is what you want to keep **LOW** in streaming
- If this grows continuously → **memory leak**

#### 4. **External**

- Memory used by **C++ objects** bound to JavaScript
- Buffers, file handles, etc.
- Important for stream monitoring

#### 5. **Array Buffers**

- Memory for `ArrayBuffer` and `SharedArrayBuffer`
- Useful for typed arrays and binary data

---

## Memory Monitoring Strategies

### Strategy 1: Periodic Sampling (Best for Long-Running Tasks)

```javascript
class MemoryMonitor {
  constructor(intervalMs = 1000) {
    this.intervalMs = intervalMs;
    this.samples = [];
  }

  start() {
    this.interval = setInterval(() => {
      const mem = process.memoryUsage();
      this.samples.push(mem);

      const heapUsedMB = (mem.heapUsed / 1024 / 1024).toFixed(2);
      const rssMB = (mem.rss / 1024 / 1024).toFixed(2);

      console.log(`[Memory] RSS: ${rssMB}MB | Heap: ${heapUsedMB}MB`);
    }, this.intervalMs);
  }

  stop() {
    clearInterval(this.interval);
    this.printStats();
  }

  printStats() {
    const heapSamples = this.samples.map((s) => s.heapUsed);
    const avgHeap = heapSamples.reduce((a, b) => a + b) / heapSamples.length;
    const maxHeap = Math.max(...heapSamples);

    console.log(`\nAverage Heap: ${(avgHeap / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Peak Heap: ${(maxHeap / 1024 / 1024).toFixed(2)}MB`);
  }
}

// Usage
const monitor = new MemoryMonitor(1000); // Sample every 1 second
monitor.start();

// ... do work ...

monitor.stop();
```

### Strategy 2: Per-Chunk Monitoring (Detailed Tracking)

```javascript
class MemoryTrackingTransform extends Transform {
  constructor(options) {
    super(options);
    this.chunkMemory = [];
  }

  _transform(chunk, encoding, callback) {
    const memBefore = process.memoryUsage().heapUsed;

    // Process chunk
    const result = this.processChunk(chunk);
    this.push(result);

    const memAfter = process.memoryUsage().heapUsed;
    const delta = memAfter - memBefore;

    this.chunkMemory.push(delta);

    // Log if memory increased significantly
    if (delta > 1024 * 1024) {
      // > 1MB increase
      console.warn(
        `⚠️  Chunk caused ${(delta / 1024 / 1024).toFixed(2)}MB increase!`
      );
    }

    callback();
  }

  _final(callback) {
    const totalDelta = this.chunkMemory.reduce((a, b) => a + b, 0);
    console.log(
      `Total memory delta: ${(totalDelta / 1024 / 1024).toFixed(2)}MB`
    );
    callback();
  }
}
```

### Strategy 3: Threshold Alerts (Production Monitoring)

```javascript
class MemoryAlertMonitor {
    constructor(thresholdMB = 100) {
        this.thresholdBytes = thresholdMB * 1024 * 1024;
        this.alerted = false;
    }

    check() {
        const mem = process.memoryUsage();

        if (mem.heapUsed > this.thresholdBytes && !this.alerted) {
            console.error(`🚨 MEMORY ALERT: Heap usage exceeded ${this.thresholdBytes / 1024 / 1024}MB`);
            console.error(`Current: ${(mem.heapUsed / 1024 / 1024).toFixed(2)}MB`);
            this.alerted = true;

            // Could trigger garbage collection
            if (global.gc) {
                console.log('Running garbage collection...');
                global.gc();
            }
        }
    }
}

// Usage in transform
_transform(chunk, encoding, callback) {
    this.memoryAlert.check();
    // ... processing ...
    callback();
}
```

---

## Expected Memory Patterns for Streams

### ✅ **Healthy Stream (Constant Memory)**

```
Memory (MB)
60 |     _______________
50 |  __/               \___
40 | /                      \
30 |/________________________\
   0s    5s    10s   15s   20s

Pattern: Flat or slightly wavy
Meaning: Backpressure working, no leaks
```

### ⚠️ **Memory Leak (Growing)**

```
Memory (MB)
200|                      ___/
150|               ____/
100|         ____/
 50|   ____/
  0|__/
   0s    5s    10s   15s   20s

Pattern: Continuously growing
Problem: Objects not being released
```

### 🔄 **Garbage Collection Spikes**

```
Memory (MB)
80 |  _    _    _    _
60 | / \  / \  / \  / \
40 |/   \/   \/   \/   \
20 |
   0s    5s    10s   15s

Pattern: Sawtooth
Meaning: Normal GC cycles
```

---

## Memory Optimization Tips

### 1. **Use Appropriate Buffer Sizes**

```javascript
// ❌ Too small - many syscalls
fs.createReadStream(file, { highWaterMark: 16 * 1024 }); // 16KB

// ✅ Good balance
fs.createReadStream(file, { highWaterMark: 64 * 1024 }); // 64KB (default)

// ✅ Large files with available memory
fs.createReadStream(file, { highWaterMark: 1024 * 1024 }); // 1MB
```

### 2. **Don't Buffer Everything**

```javascript
// ❌ BAD - Stores all results in memory
const results = [];
transform(chunk, encoding, callback) {
    const result = process(chunk);
    results.push(result);  // Memory leak!
    this.push(result);
    callback();
}

// ✅ GOOD - Just pass through
transform(chunk, encoding, callback) {
    const result = process(chunk);
    this.push(result);  // Released after consumption
    callback();
}
```

### 3. **Release References**

```javascript
// ❌ Holding references
class Parser extends Transform {
  constructor() {
    super();
    this.cache = {}; // Grows forever!
  }

  _transform(chunk, encoding, callback) {
    const id = chunk.id;
    this.cache[id] = chunk; // Never released
    callback();
  }
}

// ✅ Limited cache with cleanup
class Parser extends Transform {
  constructor() {
    super();
    this.cache = new Map();
    this.maxCacheSize = 1000;
  }

  _transform(chunk, encoding, callback) {
    // LRU-style cleanup
    if (this.cache.size > this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(chunk.id, chunk);
    callback();
  }
}
```

### 4. **Use Object Pooling for Hot Paths**

```javascript
class ObjectPool {
    constructor(create, reset) {
        this.create = create;
        this.reset = reset;
        this.pool = [];
    }

    acquire() {
        return this.pool.length > 0
            ? this.pool.pop()
            : this.create();
    }

    release(obj) {
        this.reset(obj);
        this.pool.push(obj);
    }
}

// Usage
const bufferPool = new ObjectPool(
    () => Buffer.allocUnsafe(1024),
    (buf) => buf.fill(0)
);

_transform(chunk, encoding, callback) {
    const buffer = bufferPool.acquire();
    // Use buffer...
    bufferPool.release(buffer);
    callback();
}
```

---

## Debugging Memory Issues

### 1. **Enable Garbage Collection Logs**

```bash
node --expose-gc --trace-gc your-script.js
```

### 2. **Force Garbage Collection**

```javascript
// Run with: node --expose-gc script.js
if (global.gc) {
  const memBefore = process.memoryUsage().heapUsed;
  global.gc();
  const memAfter = process.memoryUsage().heapUsed;
  console.log(
    `GC freed: ${((memBefore - memAfter) / 1024 / 1024).toFixed(2)}MB`
  );
}
```

### 3. **Take Heap Snapshots**

```javascript
const v8 = require("v8");
const fs = require("fs");

function takeHeapSnapshot(filename) {
  const snapshot = v8.writeHeapSnapshot(filename);
  console.log(`Heap snapshot written to ${snapshot}`);
}

// Take before and after snapshots
takeHeapSnapshot("./heap-before.heapsnapshot");
// ... process data ...
takeHeapSnapshot("./heap-after.heapsnapshot");

// Compare in Chrome DevTools
```

### 4. **Memory Leak Detection**

```javascript
class LeakDetector {
  constructor() {
    this.baseline = null;
    this.samples = [];
  }

  setBaseline() {
    if (global.gc) global.gc();
    this.baseline = process.memoryUsage().heapUsed;
    console.log(`Baseline: ${(this.baseline / 1024 / 1024).toFixed(2)}MB`);
  }

  check() {
    if (!this.baseline) {
      console.warn("Call setBaseline() first");
      return;
    }

    if (global.gc) global.gc();
    const current = process.memoryUsage().heapUsed;
    const growth = current - this.baseline;

    this.samples.push(growth);

    if (growth > 10 * 1024 * 1024) {
      // 10MB growth
      console.warn(
        `🚨 Possible leak: ${(growth / 1024 / 1024).toFixed(2)}MB growth`
      );
    }
  }

  analyze() {
    if (this.samples.length < 2) return;

    // Check if consistently growing
    let increasing = 0;
    for (let i = 1; i < this.samples.length; i++) {
      if (this.samples[i] > this.samples[i - 1]) {
        increasing++;
      }
    }

    const percentIncreasing = (increasing / (this.samples.length - 1)) * 100;
    if (percentIncreasing > 80) {
      console.error(
        `🚨 MEMORY LEAK DETECTED: ${percentIncreasing.toFixed(
          0
        )}% samples showing growth`
      );
    }
  }
}
```

---

## Real-World Example Output

```
Processing logs...

📊 Memory Monitor Started

[Memory] RSS: 42.35MB | Heap: 18.23MB | External: 1.45MB
[LineParser] Chunk 100 | Avg: 1.23ms/chunk | Heap: 19.12MB
[Memory] RSS: 43.21MB | Heap: 19.12MB | External: 1.48MB
[LineParser] Chunk 200 | Avg: 1.21ms/chunk | Heap: 19.87MB
[Memory] RSS: 44.05MB | Heap: 20.01MB | External: 1.52MB
[LineParser] Chunk 300 | Avg: 1.24ms/chunk | Heap: 20.45MB
[Memory] RSS: 44.98MB | Heap: 20.67MB | External: 1.55MB

[LineParser] Final Stats:
  - Processed 1,000,000 lines
  - Total chunks: 1,234
  - Total time: 1523.45ms
  - Avg per chunk: 1.23ms

[StatsCollector] Statistics:
  INFO:  700,234
  WARN:  199,876
  ERROR: 99,890

✅ Errors written to errors.log

⏱️  Total Pipeline Duration: 8.45s

============================================================
📊 MEMORY USAGE SUMMARY
============================================================

🔹 Heap Memory:
   Start:   18.23 MB
   End:     21.45 MB
   Average: 19.87 MB
   Min:     18.12 MB
   Max:     22.34 MB

🔹 RSS (Resident Set Size):
   Start:   42.35 MB
   End:     45.67 MB
   Average: 44.01 MB
   Max:     46.23 MB

🔹 External Memory:
   Start:   1.45 MB
   End:     1.58 MB

🔹 Array Buffers:
   Start:   0.00 MB
   End:     0.00 MB

============================================================

✅ Memory stayed under 50MB - excellent for processing GB files!
```

---

## Key Takeaways

1. **RSS is what matters** - that's total process memory
2. **Heap should stay relatively flat** - if growing, you have a leak
3. **External memory** tracks Buffer usage - important for streams
4. **Sample periodically** (1-5 seconds) to avoid overhead
5. **Compare before/after** to detect leaks
6. **Use Chrome DevTools** for detailed heap analysis
