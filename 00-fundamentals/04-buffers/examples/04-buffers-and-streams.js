// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Buffers and Streams - Working Together
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const fs = require('fs');
const { Transform } = require('stream');
const path = require('path');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🌊 Buffers and Streams');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// ========================================
// Part 1: Streams Default to Buffers
// ========================================

console.log('=== 1. Streams Work with Buffers by Default ===\n');

const testFile = path.join(__dirname, 'test-binary.dat');
fs.writeFileSync(testFile, Buffer.from([0x48, 0x65, 0x6C, 0x6C, 0x6F]));

console.log('Created test file with bytes: [0x48, 0x65, 0x6C, 0x6C, 0x6F]\n');

const stream1 = fs.createReadStream(testFile);

stream1.on('data', (chunk) => {
  console.log('Received chunk:');
  console.log('  Type:', typeof chunk);
  console.log('  Is Buffer?', Buffer.isBuffer(chunk));
  console.log('  Content:', chunk);
  console.log('  As hex:', chunk.toString('hex'));
  console.log('  As string:', chunk.toString());
  console.log('');
});

stream1.on('end', () => {
  console.log('✅ Stream ended\n');
  demonstrateEncoding();
});

// ========================================
// Part 2: Streams with Encoding
// ========================================

function demonstrateEncoding() {
  console.log('=== 2. Streams with Encoding ===\n');
  
  console.log('With encoding option, chunks are strings:\n');
  
  const stream2 = fs.createReadStream(testFile, {
    encoding: 'utf8'
  });
  
  stream2.on('data', (chunk) => {
    console.log('Received chunk:');
    console.log('  Type:', typeof chunk);
    console.log('  Is Buffer?', Buffer.isBuffer(chunk));
    console.log('  Content:', chunk);
    console.log('');
  });
  
  stream2.on('end', () => {
    console.log('✅ Stream ended\n');
    demonstrateSetEncoding();
  });
}

// ========================================
// Part 3: setEncoding() Method
// ========================================

function demonstrateSetEncoding() {
  console.log('=== 3. Using setEncoding() ===\n');
  
  const stream3 = fs.createReadStream(testFile);
  stream3.setEncoding('hex');
  
  console.log('Set encoding to "hex"\n');
  
  stream3.on('data', (chunk) => {
    console.log('Chunk as hex string:', chunk);
    console.log('  Type:', typeof chunk);
  });
  
  stream3.on('end', () => {
    console.log('\n✅ Stream ended\n');
    demonstrateBufferTransform();
  });
}

// ========================================
// Part 4: Transform Stream with Buffers
// ========================================

function demonstrateBufferTransform() {
  console.log('=== 4. Transform Stream Processing Buffers ===\n');
  
  // Create test file with binary data
  const binaryFile = path.join(__dirname, 'binary-data.dat');
  const data = Buffer.alloc(100);
  for (let i = 0; i < 100; i++) {
    data[i] = i;
  }
  fs.writeFileSync(binaryFile, data);
  
  console.log('Processing binary file with 100 bytes (0-99)\n');
  
  // Transform that increments each byte
  class IncrementTransform extends Transform {
    _transform(chunk, encoding, callback) {
      console.log('  Processing chunk of', chunk.length, 'bytes');
      
      // Create new buffer (don't modify original)
      const incremented = Buffer.alloc(chunk.length);
      
      for (let i = 0; i < chunk.length; i++) {
        incremented[i] = (chunk[i] + 1) % 256;
      }
      
      this.push(incremented);
      callback();
    }
  }
  
  const outputFile = path.join(__dirname, 'incremented.dat');
  
  fs.createReadStream(binaryFile)
    .pipe(new IncrementTransform())
    .pipe(fs.createWriteStream(outputFile))
    .on('finish', () => {
      console.log('\n✅ Transform complete!\n');
      
      // Verify
      const original = fs.readFileSync(binaryFile);
      const result = fs.readFileSync(outputFile);
      
      console.log('Verification:');
      console.log('  First 5 bytes (original):', [...original.slice(0, 5)]);
      console.log('  First 5 bytes (incremented):', [...result.slice(0, 5)]);
      console.log('  Byte 0: ', original[0], '→', result[0]);
      console.log('  Byte 99:', original[99], '→', result[99]);
      
      // Cleanup
      fs.unlinkSync(binaryFile);
      fs.unlinkSync(outputFile);
      
      console.log('');
      demonstrateBufferConcat();
    });
}

// ========================================
// Part 5: Concatenating Buffers from Stream
// ========================================

function demonstrateBufferConcat() {
  console.log('=== 5. Collecting Stream into Single Buffer ===\n');
  
  console.log('Sometimes you need the complete data as one buffer\n');
  
  const chunks = [];
  const stream = fs.createReadStream(testFile, {
    highWaterMark: 2 // Small chunks for demo
  });
  
  stream.on('data', (chunk) => {
    console.log('  Received chunk:', chunk.length, 'bytes');
    chunks.push(chunk);
  });
  
  stream.on('end', () => {
    const completeBuffer = Buffer.concat(chunks);
    
    console.log('\n✅ All chunks received\n');
    console.log('Total chunks:', chunks.length);
    console.log('Total bytes:', completeBuffer.length);
    console.log('Complete buffer:', completeBuffer);
    console.log('As string:', completeBuffer.toString());
    console.log('');
    
    demonstrateHighWaterMark();
  });
}

// ========================================
// Part 6: highWaterMark and Buffer Size
// ========================================

function demonstrateHighWaterMark() {
  console.log('=== 6. highWaterMark Controls Buffer Size ===\n');
  
  // Create 1KB test file
  const largeFile = path.join(__dirname, 'large.dat');
  fs.writeFileSync(largeFile, Buffer.alloc(1024, 'X'));
  
  console.log('Created 1KB test file\n');
  
  console.log('🔹 Default highWaterMark (64KB)\n');
  
  const stream1 = fs.createReadStream(largeFile);
  let chunks1 = 0;
  
  stream1.on('data', (chunk) => {
    chunks1++;
    if (chunks1 === 1) {
      console.log('  First chunk size:', chunk.length, 'bytes');
    }
  });
  
  stream1.on('end', () => {
    console.log('  Total chunks:', chunks1, '\n');
    
    console.log('🔹 Small highWaterMark (100 bytes)\n');
    
    const stream2 = fs.createReadStream(largeFile, {
      highWaterMark: 100
    });
    
    let chunks2 = 0;
    
    stream2.on('data', (chunk) => {
      chunks2++;
      if (chunks2 === 1) {
        console.log('  First chunk size:', chunk.length, 'bytes');
      }
    });
    
    stream2.on('end', () => {
      console.log('  Total chunks:', chunks2);
      console.log('');
      console.log('Smaller highWaterMark = More chunks, less memory\n');
      
      fs.unlinkSync(largeFile);
      demonstrateBufferModification();
    });
  });
}

// ========================================
// Part 7: Modifying Buffers in Streams
// ========================================

function demonstrateBufferModification() {
  console.log('=== 7. Be Careful Modifying Buffers! ===\n');
  
  console.log('⚠️  Buffers from streams might be reused!\n');
  
  const dataFile = path.join(__dirname, 'stream-data.txt');
  fs.writeFileSync(dataFile, 'ABCDEFGHIJ');
  
  console.log('🔹 WRONG: Modifying buffer directly\n');
  
  const stream1 = fs.createReadStream(dataFile, {
    highWaterMark: 5
  });
  
  const saved = [];
  
  stream1.on('data', (chunk) => {
    console.log('  Received:', chunk.toString());
    
    // WRONG: Saving reference to buffer
    saved.push(chunk);
    
    // Modifying it
    chunk[0] = 88; // Change to 'X'
  });
  
  stream1.on('end', () => {
    console.log('\n  Saved buffers:');
    saved.forEach((buf, i) => {
      console.log(`    [${i}]:`, buf.toString());
    });
    console.log('  ⚠️  They might all show same data!\n');
    
    console.log('🔹 CORRECT: Copy buffer if keeping it\n');
    
    const stream2 = fs.createReadStream(dataFile, {
      highWaterMark: 5
    });
    
    const copied = [];
    
    stream2.on('data', (chunk) => {
      console.log('  Received:', chunk.toString());
      
      // CORRECT: Make a copy
      copied.push(Buffer.from(chunk));
    });
    
    stream2.on('end', () => {
      console.log('\n  Copied buffers:');
      copied.forEach((buf, i) => {
        console.log(`    [${i}]:`, buf.toString());
      });
      console.log('  ✅ Each buffer independent!\n');
      
      fs.unlinkSync(dataFile);
      demonstrateBufferPool();
    });
  });
}

// ========================================
// Part 8: Buffer Pooling
// ========================================

function demonstrateBufferPool() {
  console.log('=== 8. Buffer Pooling ===\n');
  
  console.log('Node.js uses buffer pooling for small allocations\n');
  
  console.log('Small buffers (< 4KB) share a pool:');
  
  const small1 = Buffer.allocUnsafe(100);
  const small2 = Buffer.allocUnsafe(100);
  const small3 = Buffer.allocUnsafe(100);
  
  console.log('  Buffer 1 parent:', small1.buffer.byteLength, 'bytes');
  console.log('  Buffer 2 parent:', small2.buffer.byteLength, 'bytes');
  console.log('  Buffer 3 parent:', small3.buffer.byteLength, 'bytes');
  console.log('  Same pool?', small1.buffer === small2.buffer);
  console.log('');
  
  console.log('Large buffers (≥ 4KB) get own memory:');
  
  const large1 = Buffer.allocUnsafe(8192);
  const large2 = Buffer.allocUnsafe(8192);
  
  console.log('  Buffer 1 parent:', large1.buffer.byteLength, 'bytes');
  console.log('  Buffer 2 parent:', large2.buffer.byteLength, 'bytes');
  console.log('  Same pool?', large1.buffer === large2.buffer);
  console.log('');
  
  console.log('Why pooling matters:');
  console.log('  ✅ Reduces memory allocations');
  console.log('  ✅ Better performance for many small buffers');
  console.log('  ⚠️  Must copy if keeping buffer references\n');
  
  printSummary();
}

// ========================================
// Summary
// ========================================

function printSummary() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 Buffers & Streams Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('✅ Default Behavior:');
  console.log('   • Streams emit Buffer objects by default');
  console.log('   • Use { encoding: "utf8" } for strings\n');
  
  console.log('✅ Encoding:');
  console.log('   • Set in createReadStream({ encoding })');
  console.log('   • Or use stream.setEncoding("utf8")');
  console.log('   • Converts buffers to strings\n');
  
  console.log('✅ Transform Streams:');
  console.log('   • Receive chunks as buffers');
  console.log('   • Can process binary data directly');
  console.log('   • Don\'t modify input buffers!\n');
  
  console.log('✅ Collecting Data:');
  console.log('   • Push chunks to array');
  console.log('   • Use Buffer.concat() at end');
  console.log('   • Watch memory usage!\n');
  
  console.log('✅ highWaterMark:');
  console.log('   • Controls chunk size');
  console.log('   • Smaller = more chunks, less memory');
  console.log('   • Larger = fewer chunks, more memory\n');
  
  console.log('✅ Buffer Pooling:');
  console.log('   • Small buffers share memory pool');
  console.log('   • Copy buffers if keeping references');
  console.log('   • Buffer.from() creates independent copy\n');
  
  console.log('⚠️  Important:');
  console.log('   • Always copy buffers you want to keep');
  console.log('   • Don\'t modify stream chunk buffers');
  console.log('   • Consider memory when collecting all data\n');
  
  console.log('All examples complete! 🎉\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Cleanup
  try {
    fs.unlinkSync(testFile);
  } catch (err) {
    // Ignore
  }
}
