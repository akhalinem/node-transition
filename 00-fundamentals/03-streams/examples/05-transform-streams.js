// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Transform Streams - Modifying Data in Transit
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const { Transform, pipeline } = require('stream');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');

const pipelineAsync = promisify(pipeline);

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔄 Transform Streams');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// ========================================
// Part 1: What are Transform Streams?
// ========================================

console.log('=== 1. What are Transform Streams? ===\n');

console.log('Transform streams are both Readable AND Writable');
console.log('─────────────────────────────────────────────────\n');

console.log('┌─────────────────────────────────────┐');
console.log('│     Transform Stream                │');
console.log('│                                     │');
console.log('│  Input → [Transformation] → Output  │');
console.log('│          ↓                          │');
console.log('│      Modify data                    │');
console.log('└─────────────────────────────────────┘\n');

console.log('Examples:');
console.log('  • Compression (gzip, deflate)');
console.log('  • Encryption/Decryption');
console.log('  • Data parsing (JSON, CSV)');
console.log('  • Format conversion');
console.log('  • Data filtering\n');

// ========================================
// Part 2: Simple Transform
// ========================================

console.log('=== 2. Simple Transform Example ===\n');

console.log('Creating uppercase transform...\n');

class UpperCaseTransform extends Transform {
  _transform(chunk, encoding, callback) {
    // Convert to uppercase
    const upperChunk = chunk.toString().toUpperCase();
    
    console.log(`  Input:  "${chunk.toString().trim()}"`);
    console.log(`  Output: "${upperChunk.trim()}"\n`);
    
    // Push transformed data
    this.push(upperChunk);
    
    // Signal completion
    callback();
  }
}

const uppercase = new UpperCaseTransform();

uppercase.write('hello world\n');
uppercase.write('node.js streams\n');
uppercase.end('are awesome\n');

uppercase.on('data', (chunk) => {
  // Data comes out uppercase
});

uppercase.on('end', () => {
  console.log('✅ Transform complete!\n');
  demonstrateObjectMode();
});

// ========================================
// Part 3: Object Mode Transform
// ========================================

function demonstrateObjectMode() {
  console.log('=== 3. Object Mode Transform ===\n');
  
  console.log('Transform can work with objects, not just strings/buffers\n');
  
  class JsonParseTransform extends Transform {
    constructor(options) {
      super({ ...options, objectMode: true });
    }
    
    _transform(chunk, encoding, callback) {
      try {
        // Parse JSON string to object
        const obj = JSON.parse(chunk.toString());
        console.log(`  Parsed object:`, obj);
        this.push(obj);
        callback();
      } catch (err) {
        callback(err);
      }
    }
  }
  
  const parser = new JsonParseTransform();
  
  parser.write('{"name": "Alice", "age": 30}\n');
  parser.write('{"name": "Bob", "age": 25}\n');
  parser.end('{"name": "Charlie", "age": 35}\n');
  
  const objects = [];
  parser.on('data', (obj) => {
    objects.push(obj);
  });
  
  parser.on('end', () => {
    console.log('\n✅ All objects parsed:');
    console.log(objects);
    console.log();
    
    demonstrateFilterTransform();
  });
}

// ========================================
// Part 4: Filter Transform
// ========================================

function demonstrateFilterTransform() {
  console.log('=== 4. Filter Transform ===\n');
  
  console.log('Filter out certain data\n');
  
  class FilterTransform extends Transform {
    constructor(filterFn, options) {
      super(options);
      this.filterFn = filterFn;
    }
    
    _transform(chunk, encoding, callback) {
      const line = chunk.toString();
      
      if (this.filterFn(line)) {
        console.log(`  ✅ Keeping: "${line.trim()}"`);
        this.push(chunk);
      } else {
        console.log(`  ❌ Filtering: "${line.trim()}"`);
      }
      
      callback();
    }
  }
  
  // Filter: Only lines containing "Node"
  const filter = new FilterTransform((line) => line.includes('Node'));
  
  filter.write('Node.js is great\n');
  filter.write('Python is cool\n');
  filter.write('Node streams rock\n');
  filter.end('Java is popular\n');
  
  filter.on('end', () => {
    console.log('\n✅ Filter complete!\n');
    demonstrateBufferMode();
  });
}

// ========================================
// Part 5: Buffer Mode Transform
// ========================================

function demonstrateBufferMode() {
  console.log('=== 5. Buffer Mode Transform ===\n');
  
  console.log('Sometimes you need ALL data before transforming\n');
  
  class JsonArrayTransform extends Transform {
    constructor(options) {
      super(options);
      this.objects = [];
    }
    
    _transform(chunk, encoding, callback) {
      // Just collect objects
      try {
        const obj = JSON.parse(chunk.toString());
        console.log(`  Buffering:`, obj);
        this.objects.push(obj);
        callback();
      } catch (err) {
        callback(err);
      }
    }
    
    _flush(callback) {
      // _flush called when stream ends
      // Output everything as JSON array
      console.log('\n  Converting to array...\n');
      const json = JSON.stringify(this.objects, null, 2);
      this.push(json);
      callback();
    }
  }
  
  const toArray = new JsonArrayTransform();
  
  toArray.write('{"id": 1}\n');
  toArray.write('{"id": 2}\n');
  toArray.end('{"id": 3}\n');
  
  toArray.on('data', (chunk) => {
    console.log('Output:');
    console.log(chunk.toString());
  });
  
  toArray.on('end', () => {
    console.log('\n✅ Array transform complete!\n');
    demonstrateBuiltInTransforms();
  });
}

// ========================================
// Part 6: Built-in Transform Streams
// ========================================

async function demonstrateBuiltInTransforms() {
  console.log('=== 6. Built-in Transform Streams ===\n');
  
  const inputFile = path.join(__dirname, 'compress-test.txt');
  const compressedFile = path.join(__dirname, 'compressed.gz');
  const decompressedFile = path.join(__dirname, 'decompressed.txt');
  
  // Create test data
  const data = 'This is test data. '.repeat(100);
  fs.writeFileSync(inputFile, data);
  
  console.log('🔹 Compression with zlib\n');
  console.log(`Input size: ${data.length} bytes\n`);
  
  // Compress
  await pipelineAsync(
    fs.createReadStream(inputFile),
    zlib.createGzip(),  // Transform: compress
    fs.createWriteStream(compressedFile)
  );
  
  const compressedSize = fs.statSync(compressedFile).size;
  console.log(`✅ Compressed: ${compressedSize} bytes`);
  console.log(`   Ratio: ${((1 - compressedSize / data.length) * 100).toFixed(1)}%\n`);
  
  console.log('🔹 Decompression\n');
  
  // Decompress
  await pipelineAsync(
    fs.createReadStream(compressedFile),
    zlib.createGunzip(),  // Transform: decompress
    fs.createWriteStream(decompressedFile)
  );
  
  const decompressedData = fs.readFileSync(decompressedFile, 'utf8');
  console.log(`✅ Decompressed: ${decompressedData.length} bytes`);
  console.log(`   Match: ${data === decompressedData ? '✅ Yes' : '❌ No'}\n`);
  
  // Cleanup
  fs.unlinkSync(inputFile);
  fs.unlinkSync(compressedFile);
  fs.unlinkSync(decompressedFile);
  
  demonstrateCryptoTransform();
}

// ========================================
// Part 7: Crypto Transform Streams
// ========================================

async function demonstrateCryptoTransform() {
  console.log('=== 7. Crypto Transform Streams ===\n');
  
  console.log('🔹 Hash Transform\n');
  
  const inputFile = path.join(__dirname, 'hash-input.txt');
  fs.writeFileSync(inputFile, 'Secret data to hash');
  
  // Create hash
  const hash = crypto.createHash('sha256');
  
  await pipelineAsync(
    fs.createReadStream(inputFile),
    hash
  );
  
  const digest = hash.digest('hex');
  console.log(`SHA256 hash: ${digest}\n`);
  
  console.log('🔹 Cipher Transform (Encryption)\n');
  
  const algorithm = 'aes-256-cbc';
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);
  
  const plainFile = path.join(__dirname, 'plain.txt');
  const encryptedFile = path.join(__dirname, 'encrypted.bin');
  const decryptedFile = path.join(__dirname, 'decrypted.txt');
  
  fs.writeFileSync(plainFile, 'Super secret message!');
  
  console.log('Encrypting...\n');
  
  // Encrypt
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  await pipelineAsync(
    fs.createReadStream(plainFile),
    cipher,
    fs.createWriteStream(encryptedFile)
  );
  
  console.log('✅ Encrypted!\n');
  
  console.log('Decrypting...\n');
  
  // Decrypt
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  
  await pipelineAsync(
    fs.createReadStream(encryptedFile),
    decipher,
    fs.createWriteStream(decryptedFile)
  );
  
  const decrypted = fs.readFileSync(decryptedFile, 'utf8');
  console.log(`✅ Decrypted: "${decrypted}"\n`);
  
  // Cleanup
  fs.unlinkSync(inputFile);
  fs.unlinkSync(plainFile);
  fs.unlinkSync(encryptedFile);
  fs.unlinkSync(decryptedFile);
  
  demonstrateComplexPipeline();
}

// ========================================
// Part 8: Complex Transform Pipeline
// ========================================

async function demonstrateComplexPipeline() {
  console.log('=== 8. Complex Transform Pipeline ===\n');
  
  console.log('Pipeline: read → uppercase → filter → add prefix → write\n');
  
  const input = path.join(__dirname, 'complex-input.txt');
  const output = path.join(__dirname, 'complex-output.txt');
  
  fs.writeFileSync(input, 'keep this\nskip this\nkeep that\nskip that\n');
  
  // Transform 1: Uppercase
  const uppercase = new Transform({
    transform(chunk, encoding, callback) {
      this.push(chunk.toString().toUpperCase());
      callback();
    }
  });
  
  // Transform 2: Filter (only "KEEP" lines)
  const filter = new Transform({
    transform(chunk, encoding, callback) {
      const lines = chunk.toString().split('\n');
      const filtered = lines
        .filter(line => line.includes('KEEP'))
        .join('\n');
      if (filtered) {
        this.push(filtered + '\n');
      }
      callback();
    }
  });
  
  // Transform 3: Add prefix
  let lineNum = 0;
  const addPrefix = new Transform({
    transform(chunk, encoding, callback) {
      const lines = chunk.toString().split('\n');
      const prefixed = lines
        .map(line => line ? `[${++lineNum}] ${line}` : '')
        .join('\n');
      this.push(prefixed);
      callback();
    }
  });
  
  await pipelineAsync(
    fs.createReadStream(input, { encoding: 'utf8' }),
    uppercase,
    filter,
    addPrefix,
    fs.createWriteStream(output)
  );
  
  console.log('✅ Pipeline complete!\n');
  
  const result = fs.readFileSync(output, 'utf8');
  console.log('Result:');
  console.log(result);
  
  // Cleanup
  fs.unlinkSync(input);
  fs.unlinkSync(output);
  
  printSummary();
}

// ========================================
// Summary
// ========================================

function printSummary() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 Transform Streams Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('✅ Transform streams:');
  console.log('   • Both Readable AND Writable');
  console.log('   • Modify data in transit');
  console.log('   • Can be chained together\n');
  
  console.log('✅ Implementation:');
  console.log('   class MyTransform extends Transform {');
  console.log('     _transform(chunk, encoding, callback) {');
  console.log('       // Modify chunk');
  console.log('       this.push(modifiedData);');
  console.log('       callback();');
  console.log('     }');
  console.log('     _flush(callback) {');
  console.log('       // Optional: final output when stream ends');
  console.log('       callback();');
  console.log('     }');
  console.log('   }\n');
  
  console.log('✅ Modes:');
  console.log('   • Buffer mode (default) - chunks are Buffers');
  console.log('   • Object mode - chunks are JavaScript objects');
  console.log('   • Set with { objectMode: true }\n');
  
  console.log('✅ Built-in transforms:');
  console.log('   • zlib.createGzip() / createGunzip()');
  console.log('   • zlib.createDeflate() / createInflate()');
  console.log('   • crypto.createHash()');
  console.log('   • crypto.createCipheriv() / createDecipheriv()\n');
  
  console.log('✅ Use cases:');
  console.log('   • Compression/decompression');
  console.log('   • Encryption/decryption');
  console.log('   • Data parsing (JSON, CSV)');
  console.log('   • Format conversion');
  console.log('   • Data validation/filtering');
  console.log('   • Logging/monitoring\n');
  
  console.log('Next: Backpressure and error handling! →\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}
