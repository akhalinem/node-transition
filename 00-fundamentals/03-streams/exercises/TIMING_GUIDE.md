# Stream Performance Timing Guide

## Where to Place Timing Code

### 1. **Per-Chunk Timing** (Inside `_transform`)

**Measures:** How long each chunk takes to process

```javascript
class MyTransform extends Transform {
  _transform(chunk, encoding, callback) {
    const startTime = performance.now();

    // Your processing logic here
    const result = process(chunk);
    this.push(result);

    const endTime = performance.now();
    console.log(`Chunk processed in ${(endTime - startTime).toFixed(2)}ms`);

    callback();
  }
}
```

**Best for:**

- Finding slow chunks
- Identifying performance bottlenecks
- Debugging processing issues

**⚠️ Warning:** Lots of console output! Use sparingly or log every N chunks.

---

### 2. **Aggregate Timing** (Track totals)

**Measures:** Average processing time across all chunks

```javascript
class MyTransform extends Transform {
  constructor(options) {
    super(options);
    this.totalTime = 0;
    this.chunkCount = 0;
  }

  _transform(chunk, encoding, callback) {
    const startTime = performance.now();

    const result = process(chunk);
    this.push(result);

    this.totalTime += performance.now() - startTime;
    this.chunkCount++;

    callback();
  }

  _final(callback) {
    const avgTime = (this.totalTime / this.chunkCount).toFixed(2);
    console.log(`Avg processing time: ${avgTime}ms/chunk`);
    console.log(`Total time: ${this.totalTime.toFixed(2)}ms`);
    callback();
  }
}
```

**Best for:**

- Understanding overall performance
- Comparing different approaches
- Production monitoring

---

### 3. **Pipeline-Level Timing** (Outside streams)

**Measures:** Total end-to-end time

```javascript
async function processFile(inputFile, outputFile) {
  const startTime = performance.now();

  await pipeline(
    fs.createReadStream(inputFile),
    new Transform1(),
    new Transform2(),
    fs.createWriteStream(outputFile)
  );

  const duration = ((performance.now() - startTime) / 1000).toFixed(2);
  console.log(`Pipeline completed in ${duration}s`);
}
```

**Best for:**

- User-facing time estimates
- Overall system performance
- SLA monitoring

---

### 4. **Per-Stage Timing** (Multiple transforms)

**Measures:** How long each stage of the pipeline takes

```javascript
class TimingTransform extends Transform {
  constructor(stageName, options) {
    super(options);
    this.stageName = stageName;
    this.totalTime = 0;
    this.count = 0;
  }

  _transform(chunk, encoding, callback) {
    const start = performance.now();

    // Just pass through
    this.push(chunk);

    this.totalTime += performance.now() - start;
    this.count++;
    callback();
  }

  _final(callback) {
    console.log(`[${this.stageName}] ${this.totalTime.toFixed(2)}ms total`);
    callback();
  }
}

// Use between each stage
await pipeline(
  fs.createReadStream(file),
  new TimingTransform("After Read"),
  new Parser(),
  new TimingTransform("After Parse"),
  new Filter(),
  new TimingTransform("After Filter"),
  fs.createWriteStream(output)
);
```

**Best for:**

- Identifying bottleneck stages
- Optimizing specific transforms
- Understanding data flow timing

---

## Complete Example: Multi-Level Timing

```javascript
class InstrumentedTransform extends Transform {
  constructor(name, options) {
    super(options);
    this.name = name;

    // Chunk-level metrics
    this.chunkTimes = [];
    this.minTime = Infinity;
    this.maxTime = 0;

    // Overall metrics
    this.totalTime = 0;
    this.chunkCount = 0;
    this.startTime = null;
  }

  _transform(chunk, encoding, callback) {
    if (!this.startTime) {
      this.startTime = performance.now();
    }

    const chunkStart = performance.now();

    // Your actual processing
    const result = this.process(chunk);
    this.push(result);

    const chunkDuration = performance.now() - chunkStart;

    // Track metrics
    this.chunkTimes.push(chunkDuration);
    this.minTime = Math.min(this.minTime, chunkDuration);
    this.maxTime = Math.max(this.maxTime, chunkDuration);
    this.totalTime += chunkDuration;
    this.chunkCount++;

    callback();
  }

  _final(callback) {
    const endTime = performance.now();
    const wallClockTime = endTime - this.startTime;
    const avgTime = this.totalTime / this.chunkCount;

    // Calculate percentiles
    const sorted = this.chunkTimes.sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];

    console.log(`\n[${this.name}] Performance Report:`);
    console.log(`  Wall clock time: ${wallClockTime.toFixed(2)}ms`);
    console.log(`  Processing time: ${this.totalTime.toFixed(2)}ms`);
    console.log(`  Chunks processed: ${this.chunkCount}`);
    console.log(`  Avg per chunk:   ${avgTime.toFixed(2)}ms`);
    console.log(`  Min chunk:       ${this.minTime.toFixed(2)}ms`);
    console.log(`  Max chunk:       ${this.maxTime.toFixed(2)}ms`);
    console.log(`  P50 (median):    ${p50.toFixed(2)}ms`);
    console.log(`  P95:             ${p95.toFixed(2)}ms`);
    console.log(`  P99:             ${p99.toFixed(2)}ms`);
    console.log(
      `  CPU efficiency:  ${((this.totalTime / wallClockTime) * 100).toFixed(
        1
      )}%`
    );

    callback();
  }

  process(chunk) {
    // Override this in subclasses
    return chunk;
  }
}
```

---

## Timing Tools Comparison

| Tool                      | Resolution   | Best For                  |
| ------------------------- | ------------ | ------------------------- |
| `Date.now()`              | Milliseconds | Coarse timing, timestamps |
| `performance.now()`       | Microseconds | Accurate chunk timing     |
| `process.hrtime.bigint()` | Nanoseconds  | Ultra-precise timing      |
| `console.time/timeEnd`    | Milliseconds | Quick debugging           |

### Recommended: `performance.now()`

```javascript
const start = performance.now();
// do work
const duration = performance.now() - start; // in milliseconds
```

---

## Expected Output from Your Enhanced Code

```
Processing logs...

[LineParser] Processed 100 chunks | Avg: 1.23ms/chunk | Total: 123.45ms
[LineParser] Processed 200 chunks | Avg: 1.21ms/chunk | Total: 242.10ms
...

[LineParser] Final Stats:
  - Processed 1,000,000 lines
  - Total chunks: 1,234
  - Total time: 1523.45ms
  - Avg per chunk: 1.23ms

[StatsCollector] Statistics:
  INFO:  700,234
  WARN:  199,876
  ERROR: 99,890
  - Processing time: 45.23ms
  - Avg per entry: 0.0000ms

✅ Errors written to errors.log

⏱️  Total Pipeline Duration: 8.45s
```

---

## Key Insights from Timing

1. **Wall clock time ≠ Processing time**

   - Pipeline: 8.45s (total)
   - LineParser: 1.52s (CPU work)
   - StatsCollector: 0.05s (CPU work)
   - **Difference = I/O wait time** (~6.88s)

2. **Where time is spent:**

   - Reading from disk: ~40%
   - Parsing text: ~18%
   - Writing to disk: ~40%
   - Everything else: ~2%

3. **Optimization targets:**
   - If processing time is high: optimize transforms
   - If I/O wait is high: optimize buffers, use SSD
   - If both are high: consider parallelization

---

## Pro Tips

1. **Sample, don't log everything**

   ```javascript
   if (this.chunkCount % 100 === 0) {
     console.log(`Progress: ${this.chunkCount} chunks`);
   }
   ```

2. **Use environment variables**

   ```javascript
   const DEBUG_TIMING = process.env.DEBUG_TIMING === "true";
   if (DEBUG_TIMING) {
     console.log(`Chunk time: ${duration}ms`);
   }
   ```

3. **Write timing to file**

   ```javascript
   const timingStream = fs.createWriteStream("timing.csv");
   timingStream.write(`chunk,duration\n`);
   timingStream.write(`${this.chunkCount},${duration}\n`);
   ```

4. **Use profiling tools**
   ```bash
   node --prof your-script.js
   node --prof-process isolate-*.log > processed.txt
   ```
