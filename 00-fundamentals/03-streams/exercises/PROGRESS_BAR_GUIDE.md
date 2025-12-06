# Progress Bar Implementation for Node.js Streams

## Overview

Progress bars provide visual feedback during long-running stream operations. This guide shows how to implement them properly without blocking the event loop.

## Basic Progress Bar Implementation

### Simple Version

```javascript
class ProgressBar {
  constructor(totalBytes) {
    this.totalBytes = totalBytes;
    this.processedBytes = 0;
    this.startTime = Date.now();
  }

  update(bytes) {
    this.processedBytes += bytes;
    this.render();
  }

  render() {
    const percent = (this.processedBytes / this.totalBytes) * 100;
    const bar = "█".repeat(Math.floor(percent / 2));
    const empty = "░".repeat(50 - Math.floor(percent / 2));

    process.stdout.write(`\r[${bar}${empty}] ${percent.toFixed(1)}%`);
  }

  complete() {
    process.stdout.write("\n");
  }
}
```

### Advanced Version with Metrics

```javascript
class ProgressBar {
  constructor(options = {}) {
    this.totalBytes = options.totalBytes || 0;
    this.label = options.label || "Progress";
    this.width = options.width || 40;
    this.startTime = Date.now();
    this.processedBytes = 0;
    this.processedLines = 0;
    this.interval = null;
    this.updateIntervalMs = options.updateIntervalMs || 500;
  }

  start() {
    this.startTime = Date.now();
    this.interval = setInterval(() => {
      this.render();
    }, this.updateIntervalMs);
  }

  update(bytesProcessed, linesProcessed) {
    this.processedBytes = bytesProcessed;
    this.processedLines = linesProcessed;
  }

  render() {
    const elapsed = (Date.now() - this.startTime) / 1000;
    const percent =
      this.totalBytes > 0
        ? Math.min(100, (this.processedBytes / this.totalBytes) * 100)
        : 0;

    // Progress bar
    const filledWidth = Math.round((percent / 100) * this.width);
    const emptyWidth = this.width - filledWidth;
    const bar = "█".repeat(filledWidth) + "░".repeat(emptyWidth);

    // Metrics
    const linesPerSec =
      elapsed > 0 ? Math.round(this.processedLines / elapsed) : 0;
    const mbProcessed = (this.processedBytes / 1024 / 1024).toFixed(2);
    const mbTotal = (this.totalBytes / 1024 / 1024).toFixed(2);

    // ETA
    const eta =
      percent > 0 && percent < 100
        ? Math.round((elapsed / percent) * (100 - percent))
        : 0;

    // Clear and write
    process.stdout.write("\r\x1b[K");
    process.stdout.write(
      `${this.label}: [${bar}] ${percent.toFixed(1)}% | ` +
        `${this.formatNumber(this.processedLines)} lines | ` +
        `${mbProcessed}/${mbTotal}MB | ` +
        `${this.formatNumber(linesPerSec)} lines/s | ` +
        `ETA: ${this.formatTime(eta)}`
    );
  }

  complete() {
    if (this.interval) {
      clearInterval(this.interval);
    }

    const elapsed = (Date.now() - this.startTime) / 1000;
    const linesPerSec = Math.round(this.processedLines / elapsed);

    process.stdout.write("\r\x1b[K");
    process.stdout.write(
      `${this.label}: [${"█".repeat(this.width)}] 100.0% | ` +
        `${this.formatNumber(this.processedLines)} lines | ` +
        `${this.formatNumber(linesPerSec)} lines/s | ` +
        `Done in ${elapsed.toFixed(2)}s\n`
    );
  }

  formatNumber(num) {
    return new Intl.NumberFormat().format(num);
  }

  formatTime(seconds) {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }
}
```

## Integration with Streams

### Method 1: Pass Progress Bar to Transform

```javascript
class LineParser extends Transform {
  constructor(options) {
    super({ ...options, objectMode: true });
    this.progressBar = options.progressBar || null;
    this.bytesProcessed = 0;
    this.linesProcessed = 0;
  }

  _transform(chunk, encoding, callback) {
    this.bytesProcessed += chunk.length;

    // Process chunk
    const lines = chunk.toString().split("\n");
    lines.forEach((line) => {
      this.push(parseLine(line));
      this.linesProcessed++;
    });

    // Update progress bar
    if (this.progressBar) {
      this.progressBar.update(this.bytesProcessed, this.linesProcessed);
    }

    callback();
  }
}

// Usage
const progressBar = new ProgressBar({ totalBytes: fileSize });
progressBar.start();

await pipeline(
  fs.createReadStream(file),
  new LineParser({ progressBar }),
  destination
);

progressBar.complete();
```

### Method 2: Dedicated Progress Transform

```javascript
class ProgressTransform extends Transform {
  constructor(totalBytes, options) {
    super(options);
    this.progressBar = new ProgressBar({ totalBytes });
    this.bytesProcessed = 0;
  }

  _transform(chunk, encoding, callback) {
    this.bytesProcessed += chunk.length;
    this.progressBar.update(this.bytesProcessed);
    this.push(chunk); // Pass through
    callback();
  }

  _final(callback) {
    this.progressBar.complete();
    callback();
  }
}

// Usage
await pipeline(
  fs.createReadStream(file),
  new ProgressTransform(fileSize),
  new LineParser(),
  destination
);
```

### Method 3: External Event Listener

```javascript
const progressBar = new ProgressBar({ totalBytes: fileSize });
progressBar.start();

const readStream = fs.createReadStream(file);
let bytesRead = 0;

readStream.on("data", (chunk) => {
  bytesRead += chunk.length;
  progressBar.update(bytesRead);
});

await pipeline(readStream, new LineParser(), destination);

progressBar.complete();
```

## ANSI Escape Codes for Terminal Control

```javascript
// Clear current line
process.stdout.write("\r\x1b[K");

// Move cursor up N lines
process.stdout.write(`\x1b[${N}A`);

// Move cursor down N lines
process.stdout.write(`\x1b[${N}B`);

// Hide cursor
process.stdout.write("\x1b[?25l");

// Show cursor
process.stdout.write("\x1b[?25h");

// Colors
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

process.stdout.write(`${colors.green}Success!${colors.reset}\n`);
```

## Multi-Line Progress Display

```javascript
class MultiProgress {
  constructor() {
    this.bars = new Map();
    this.interval = null;
  }

  add(name, totalBytes) {
    this.bars.set(name, {
      total: totalBytes,
      processed: 0,
      label: name,
    });
  }

  update(name, processed) {
    const bar = this.bars.get(name);
    if (bar) {
      bar.processed = processed;
    }
  }

  start() {
    // Hide cursor
    process.stdout.write("\x1b[?25l");

    this.interval = setInterval(() => {
      this.render();
    }, 500);
  }

  render() {
    // Move cursor to start position
    process.stdout.write(`\x1b[${this.bars.size}A`);

    for (const [name, bar] of this.bars) {
      const percent = (bar.processed / bar.total) * 100;
      const filled = Math.round(percent / 2.5);
      const progress = "█".repeat(filled) + "░".repeat(40 - filled);

      process.stdout.write("\r\x1b[K");
      process.stdout.write(
        `${bar.label}: [${progress}] ${percent.toFixed(1)}%\n`
      );
    }
  }

  complete() {
    clearInterval(this.interval);
    // Show cursor
    process.stdout.write("\x1b[?25h");
    console.log("\n✅ All tasks completed!");
  }
}

// Usage
const multi = new MultiProgress();
multi.add("File 1", file1Size);
multi.add("File 2", file2Size);
multi.add("File 3", file3Size);
multi.start();

// Update from different streams
stream1.on("data", (chunk) => multi.update("File 1", bytesRead1));
stream2.on("data", (chunk) => multi.update("File 2", bytesRead2));
stream3.on("data", (chunk) => multi.update("File 3", bytesRead3));
```

## Spinner for Unknown Progress

```javascript
class Spinner {
  constructor(message = "Processing...") {
    this.message = message;
    this.frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    this.currentFrame = 0;
    this.interval = null;
  }

  start() {
    this.interval = setInterval(() => {
      process.stdout.write(
        `\r${this.frames[this.currentFrame]} ${this.message}`
      );
      this.currentFrame = (this.currentFrame + 1) % this.frames.length;
    }, 80);
  }

  stop(finalMessage = "Done!") {
    clearInterval(this.interval);
    process.stdout.write(`\r✅ ${finalMessage}\n`);
  }
}

// Usage
const spinner = new Spinner("Processing logs...");
spinner.start();

await processLogs();

spinner.stop("Logs processed successfully!");
```

## Performance Considerations

### 1. Update Interval

```javascript
// ❌ TOO FREQUENT - Slows down processing
_transform(chunk, encoding, callback) {
    this.progressBar.update(this.bytes);  // Called for every chunk!
    callback();
}

// ✅ THROTTLED - Updates every 500ms
constructor(options) {
    this.interval = setInterval(() => {
        this.render();
    }, 500);  // Update only 2x per second
}
```

### 2. Conditional Rendering

```javascript
update(bytes) {
    this.processedBytes = bytes;

    // Only render if enough time has passed
    const now = Date.now();
    if (now - this.lastRender > 500) {
        this.render();
        this.lastRender = now;
    }
}
```

### 3. Batch Updates

```javascript
_transform(chunk, encoding, callback) {
    this.bytesProcessed += chunk.length;

    // Only update progress every 100 chunks
    if (this.chunkCount++ % 100 === 0) {
        this.progressBar.update(this.bytesProcessed);
    }

    callback();
}
```

## Example Output

```
Processing logs...

📄 File size: 5625.34 MB

📊 Processing: [████████████████████░░░░░░░░░░░░░░░░░░░░] 52.3% | 107,234,567 lines | 2,941.23/5625.34MB | 2,450,000 lines/s | ETA: 1m 23s
[Memory] RSS: 145.23MB | Heap: 28.45/32.00MB | External: 2.12MB

📊 Processing: [████████████████████████████████████████] 100.0% | 204,516,618 lines | 2,770,000 lines/s | Done in 73.81s

[LineParser] Final Stats:
  - Processed 204,516,618 lines
  - Total chunks: 10,695
  - Total time: 24964.96ms
  - Avg per chunk: 2.33ms

[StatsCollector] Statistics:
  INFO:  143,149,119
  WARN:  40,901,382
  ERROR: 20,466,117

✅ Errors written to errors.log
```

## Common Pitfalls

### 1. **Don't block the event loop**

```javascript
// ❌ BAD - Synchronous rendering every chunk
_transform(chunk, encoding, callback) {
    this.progressBar.render();  // Blocks!
    callback();
}

// ✅ GOOD - Async interval-based rendering
constructor() {
    setInterval(() => this.render(), 500);
}
```

### 2. **Clean up intervals**

```javascript
// ❌ BAD - Interval keeps running
progressBar.start();
// ... forgot to stop

// ✅ GOOD - Always clean up
try {
  progressBar.start();
  await process();
} finally {
  progressBar.complete(); // Clears interval
}
```

### 3. **Handle terminal size**

```javascript
constructor() {
    this.width = Math.min(
        40,
        process.stdout.columns - 50  // Leave room for text
    );
}
```

## Libraries

If you don't want to implement your own:

```bash
npm install cli-progress
npm install progress
npm install ora  # For spinners
```

```javascript
import cliProgress from "cli-progress";

const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
bar.start(totalBytes, 0);

stream.on("data", (chunk) => {
  bar.update(bytesRead);
});

bar.stop();
```

## Key Takeaways

1. **Use intervals**, not per-chunk updates (performance!)
2. **Clear the line** with `\r\x1b[K` before writing
3. **Always clean up** intervals in `_final` or `finally`
4. **Get file size** with `fs.statSync()` for accurate progress
5. **Show meaningful metrics**: lines/sec, ETA, memory
6. **Throttle updates** to 2-4 times per second max
