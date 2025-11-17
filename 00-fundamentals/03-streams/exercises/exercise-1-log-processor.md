# Exercise 1: File Processing with Streams

**Difficulty**: ⭐⭐  
**Time**: 30-45 minutes

## Goal

Build a log file analyzer that processes large log files efficiently using streams. This simulates real-world scenarios where you can't load entire files into memory.

## Requirements

Create a Node.js script that:

1. **Reads a large log file** line by line using streams
2. **Filters logs** by severity level (ERROR, WARN, INFO)
3. **Counts occurrences** of each log level
4. **Extracts error messages** and writes them to a separate file
5. **Handles backpressure** properly
6. **Reports statistics** at the end

## Log Format

Each line follows this format:

```
[TIMESTAMP] [LEVEL] message
```

Example:

```
[2024-01-15 10:23:45] [INFO] Server started
[2024-01-15 10:24:12] [ERROR] Database connection failed
[2024-01-15 10:24:13] [WARN] Retrying connection
```

## Task Breakdown

### Part 1: Generate Test Data

Create a function to generate a large test log file:

```javascript
// TODO: Implement generateLogs()
function generateLogs(filename, lines) {
  // Generate random log entries
  // Levels: 70% INFO, 20% WARN, 10% ERROR
  // Write using createWriteStream
}
```

### Part 2: Create Line Transform

Create a transform stream that:

- Splits input by newlines
- Parses each log line
- Emits parsed objects

```javascript
// TODO: Implement LineParser transform
class LineParser extends Transform {
  constructor(options) {
    super({ ...options, objectMode: true });
    this.buffer = "";
  }

  _transform(chunk, encoding, callback) {
    // Split by newlines
    // Parse format: [TIMESTAMP] [LEVEL] message
    // Push parsed objects
  }
}
```

### Part 3: Create Filter Transform

```javascript
// TODO: Implement LogFilter transform
class LogFilter extends Transform {
  constructor(level, options) {
    super({ ...options, objectMode: true });
    this.targetLevel = level;
  }

  _transform(logEntry, encoding, callback) {
    // Only pass through logs matching target level
  }
}
```

### Part 4: Create Stats Collector

```javascript
// TODO: Implement StatsCollector
class StatsCollector extends Writable {
  constructor(options) {
    super({ ...options, objectMode: true });
    this.stats = { INFO: 0, WARN: 0, ERROR: 0 };
  }

  _write(logEntry, encoding, callback) {
    // Count log levels
  }

  _final(callback) {
    // Print stats
  }
}
```

### Part 5: Build the Pipeline

```javascript
const { pipeline } = require("stream");

// TODO: Create pipeline
// Read logs → Parse lines → Filter errors → Write to file
// Also: Collect statistics
```

## Expected Output

```
Processing logs...
✅ Processed 100,000 lines

Statistics:
  INFO:  70,234
  WARN:  19,876
  ERROR: 9,890

✅ Errors written to errors.log
```

## Bonus Challenges

1. **Add timestamps**: Track processing time
2. **Memory monitoring**: Log memory usage during processing
3. **Progress bar**: Show progress as lines are processed
4. **Top errors**: Find most common error messages
5. **Date filtering**: Only process logs from specific date range

## Files to Create

- `exercise-1-solution.js` - Your implementation
- `test-logs.log` - Generated test file (100K+ lines)
- `errors.log` - Extracted error logs

## Testing

```bash
# Generate and process logs
node exercise-1-solution.js

# Verify output
wc -l test-logs.log
wc -l errors.log
```

## Hints

1. Use `{ objectMode: true }` for transforms that work with parsed objects
2. Remember to handle incomplete lines in the buffer
3. Use `pipeline()` for automatic error handling
4. Test with small files first, then scale up
5. Check memory usage with `process.memoryUsage()`

## Common Mistakes to Avoid

- ❌ Loading entire file into memory
- ❌ Not handling backpressure in manual writes
- ❌ Forgetting to handle the last line if no trailing newline
- ❌ Not using `pipeline()` for error handling
- ❌ Blocking the event loop with synchronous operations

## Success Criteria

- ✅ Processes 100K+ lines without memory issues
- ✅ Correctly counts all log levels
- ✅ Extracts only ERROR level logs
- ✅ Handles backpressure properly
- ✅ Reports statistics at completion
- ✅ Uses `pipeline()` for error handling

Good luck! 🚀
