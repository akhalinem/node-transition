# Exercise 2: CSV to JSON Transformer

**Difficulty**: ⭐⭐⭐  
**Time**: 45-60 minutes

## Goal

Build a streaming CSV to JSON converter that transforms large CSV files into JSON format without loading the entire file into memory. This is a common data processing task in backend systems.

## Requirements

Create a pipeline that:

1. **Reads CSV file** with streaming
2. **Parses CSV** rows into objects
3. **Validates data** (skip invalid rows)
4. **Transforms data** (apply custom transformations)
5. **Writes JSON** in different formats:
   - JSON Lines (one object per line)
   - JSON Array (pretty-printed)
6. **Reports validation errors** to separate file

## CSV Format

Input CSV:

```csv
id,name,email,age,country
1,Alice Smith,alice@example.com,30,USA
2,Bob Jones,bob@example.com,25,UK
3,Charlie,invalid-email,35,Canada
4,Diana Prince,diana@example.com,28,USA
```

## Task Breakdown

### Part 1: CSV Parser Transform

```javascript
// TODO: Implement CSVParser
class CSVParser extends Transform {
  constructor(options) {
    super({ ...options, objectMode: true });
    this.headers = null;
    this.rowNumber = 0;
  }

  _transform(chunk, encoding, callback) {
    // Split by newlines
    // First line = headers
    // Subsequent lines = data
    // Create objects: { id, name, email, age, country }
  }
}
```

### Part 2: Data Validator Transform

```javascript
// TODO: Implement DataValidator
class DataValidator extends Transform {
  constructor(options) {
    super({ ...options, objectMode: true });
    this.errors = [];
  }

  _transform(record, encoding, callback) {
    // Validate:
    // - id is a number
    // - name is not empty
    // - email matches regex
    // - age is 18-100
    //
    // If valid: push record
    // If invalid: collect error, don't push
  }

  _flush(callback) {
    // Write errors to file at end
  }
}
```

### Part 3: Data Transformer

```javascript
// TODO: Implement DataTransformer
class DataTransformer extends Transform {
  constructor(transformFn, options) {
    super({ ...options, objectMode: true });
    this.transform = transformFn;
  }

  _transform(record, encoding, callback) {
    // Apply custom transformation
    // Example: normalize country codes, format names, etc.
  }
}
```

### Part 4: JSON Array Writer

```javascript
// TODO: Implement JSONArrayWriter
class JSONArrayWriter extends Writable {
  constructor(outputPath, options) {
    super({ ...options, objectMode: true });
    this.outputPath = outputPath;
    this.records = [];
  }

  _write(record, encoding, callback) {
    // Collect records
  }

  _final(callback) {
    // Write as JSON array
    // Pretty print with 2-space indent
  }
}
```

### Part 5: JSON Lines Writer

```javascript
// TODO: Implement JSONLinesWriter
class JSONLinesWriter extends Writable {
  constructor(outputPath, options) {
    super({ ...options, objectMode: true });
    this.writeStream = fs.createWriteStream(outputPath);
  }

  _write(record, encoding, callback) {
    // Write one JSON object per line
    // Handle backpressure from writeStream
  }

  _final(callback) {
    // Close writeStream
  }
}
```

### Part 6: Build Dual Pipelines

```javascript
// TODO: Create two pipelines
// Pipeline 1: CSV → Parser → Validator → Transformer → JSONArray
// Pipeline 2: CSV → Parser → Validator → Transformer → JSONLines
```

## Test Data Generator

Create a function to generate test CSV:

```javascript
function generateTestCSV(filename, rows) {
  const names = ["Alice", "Bob", "Charlie", "Diana", "Eve"];
  const countries = ["USA", "UK", "Canada", "Australia"];

  // Generate CSV with:
  // - 90% valid data
  // - 10% invalid data (bad emails, ages, etc.)
}
```

## Expected Output

```
Processing input.csv...

✅ Parsing complete
   Total rows: 10,000
   Valid rows: 9,123
   Invalid rows: 877

📊 Validation errors:
   Invalid email: 234
   Invalid age: 156
   Missing name: 487

✅ Output files created:
   output.json (JSON array)
   output.jsonl (JSON lines)
   errors.log (validation errors)

⏱️  Processing time: 1.23s
💾 Memory used: 45MB
```

## Bonus Challenges

1. **Custom delimiters**: Support different CSV formats (semicolon, tab)
2. **Quoted fields**: Handle fields with commas inside quotes
3. **Large fields**: Handle very long text fields efficiently
4. **Streaming validation**: Validate against schema (JSON Schema)
5. **Compression**: Write gzipped output
6. **Type coercion**: Auto-convert strings to numbers/booleans
7. **Duplicate detection**: Skip duplicate records by ID

## Advanced Features

### Type Inference

```javascript
// Infer types from data
// "123" → 123 (number)
// "true" → true (boolean)
// "2024-01-15" → Date object
```

### Transform Functions

```javascript
// Example transformations
const transforms = {
  name: (val) => val.trim().toUpperCase(),
  email: (val) => val.toLowerCase(),
  country: (val) => countryCodeMap[val] || val,
  age: (val) => parseInt(val, 10),
};
```

## Files to Create

- `exercise-2-solution.js` - Main implementation
- `csv-parser.js` - CSV parser transform
- `validator.js` - Validation transform
- `json-writer.js` - JSON writers
- `test-data-generator.js` - Generate test CSV
- `input.csv` - Test input (10K rows)
- `output.json` - JSON array output
- `output.jsonl` - JSON lines output
- `errors.log` - Validation errors

## Testing

```bash
# Generate test data
node test-data-generator.js

# Run conversion
node exercise-2-solution.js

# Verify output
cat output.json | jq length
wc -l output.jsonl
cat errors.log
```

## Email Validation Regex

```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

## Hints

1. Use `split-transform-stream` pattern for CSV parsing
2. Keep a buffer for incomplete lines
3. Handle edge cases: empty fields, quotes, escaped characters
4. Use object mode for all transforms after parsing
5. Test memory usage with `process.memoryUsage()`
6. Use `pipeline()` for automatic error propagation

## Common Mistakes to Avoid

- ❌ Loading entire CSV into memory
- ❌ Not handling quoted fields with commas
- ❌ Forgetting to handle the last line
- ❌ Creating array in memory for JSON output (defeats streaming!)
- ❌ Not handling backpressure in custom writers
- ❌ Using synchronous operations

## Success Criteria

- ✅ Processes 10K+ rows with < 100MB memory
- ✅ Correctly parses CSV with headers
- ✅ Validates all fields according to rules
- ✅ Reports validation errors with line numbers
- ✅ Outputs both JSON formats correctly
- ✅ Handles backpressure properly
- ✅ Completes without errors

## Memory Challenge

Can you process a 1GB CSV file (millions of rows) with less than 100MB of memory?

Good luck! 🚀
