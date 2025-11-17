// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Readable Streams - Reading Data from Sources
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const fs = require('fs');
const { Readable } = require('stream');
const path = require('path');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📖 Readable Streams Deep Dive');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// ========================================
// Part 1: Reading from Files
// ========================================

console.log('=== 1. Reading from Files ===\n');

// Create a test file
const testFile = path.join(__dirname, 'test-data.txt');
fs.writeFileSync(testFile, 'Line 1: Hello World\nLine 2: Streams are awesome\nLine 3: Node.js rocks\n');

console.log('🔹 Flowing Mode (Automatic)');
console.log('────────────────────────────\n');

const readStream1 = fs.createReadStream(testFile, {
  encoding: 'utf8',
  highWaterMark: 10 // Small chunk size for demo (10 bytes)
});

console.log('Stream created with:');
console.log('  • encoding: utf8 (decode bytes to string)');
console.log('  • highWaterMark: 10 bytes (chunk size)\n');

let chunkCount = 0;
let totalBytes = 0;

readStream1.on('data', (chunk) => {
  chunkCount++;
  totalBytes += chunk.length;
  console.log(`Chunk ${chunkCount}: "${chunk}" (${chunk.length} bytes)`);
});

readStream1.on('end', () => {
  console.log(`\n✅ Finished reading!`);
  console.log(`   Total chunks: ${chunkCount}`);
  console.log(`   Total bytes: ${totalBytes}\n`);
  
  // Continue to Part 2
  demonstratePausedMode();
});

readStream1.on('error', (err) => {
  console.error('❌ Error:', err.message);
});

// ========================================
// Part 2: Paused Mode (Manual Control)
// ========================================

function demonstratePausedMode() {
  console.log('🔹 Paused Mode (Manual Control)');
  console.log('────────────────────────────────\n');
  
  const readStream2 = fs.createReadStream(testFile, {
    encoding: 'utf8',
    highWaterMark: 20
  });
  
  console.log('Stream starts in paused mode (no "data" listener yet)\n');
  
  let chunks = [];
  
  readStream2.on('readable', () => {
    console.log('📨 "readable" event fired - data is available');
    
    let chunk;
    while ((chunk = readStream2.read()) !== null) {
      console.log(`   Read chunk: "${chunk}"`);
      chunks.push(chunk);
    }
    
    console.log('   Buffer is empty now\n');
  });
  
  readStream2.on('end', () => {
    console.log('✅ Finished reading!');
    console.log(`   Total chunks: ${chunks.length}`);
    console.log(`   Combined: "${chunks.join('')}"\n`);
    
    demonstrateStreamControl();
  });
}

// ========================================
// Part 3: Stream Control (pause/resume)
// ========================================

function demonstrateStreamControl() {
  console.log('🔹 Stream Control (pause/resume)');
  console.log('─────────────────────────────────\n');
  
  const readStream3 = fs.createReadStream(testFile, {
    encoding: 'utf8',
    highWaterMark: 10
  });
  
  let processedChunks = 0;
  
  readStream3.on('data', (chunk) => {
    processedChunks++;
    console.log(`Processing chunk ${processedChunks}: "${chunk}"`);
    
    // Simulate slow processing
    if (processedChunks === 2) {
      console.log('⏸️  Pausing stream for 1 second...');
      readStream3.pause();
      
      setTimeout(() => {
        console.log('▶️  Resuming stream...\n');
        readStream3.resume();
      }, 1000);
    }
  });
  
  readStream3.on('end', () => {
    console.log('✅ Finished!\n');
    demonstrateCustomReadable();
  });
}

// ========================================
// Part 4: Custom Readable Stream
// ========================================

function demonstrateCustomReadable() {
  console.log('🔹 Custom Readable Stream');
  console.log('──────────────────────────\n');
  
  console.log('Creating a counter stream that generates numbers...\n');
  
  class CounterStream extends Readable {
    constructor(max, options) {
      super(options);
      this.current = 1;
      this.max = max;
    }
    
    // _read is called when stream needs more data
    _read() {
      if (this.current <= this.max) {
        // Push data to stream
        const data = `Number: ${this.current}\n`;
        console.log(`  Generating: ${data.trim()}`);
        this.push(data);
        this.current++;
      } else {
        // Signal end of stream
        console.log('  Reached max, ending stream');
        this.push(null);
      }
    }
  }
  
  const counter = new CounterStream(5);
  
  let output = '';
  counter.on('data', (chunk) => {
    output += chunk;
  });
  
  counter.on('end', () => {
    console.log('\n✅ Custom stream finished!');
    console.log('Output:\n' + output);
    
    demonstrateStreamFrom();
  });
}

// ========================================
// Part 5: Readable.from() - Modern API
// ========================================

function demonstrateStreamFrom() {
  console.log('🔹 Readable.from() - Easy Stream Creation');
  console.log('───────────────────────────────────────────\n');
  
  // Create stream from array
  console.log('Creating stream from array:\n');
  const arrayStream = Readable.from(['Hello', ' ', 'World', '!']);
  
  let result = '';
  arrayStream.on('data', (chunk) => {
    result += chunk;
    console.log(`  Received: "${chunk}"`);
  });
  
  arrayStream.on('end', () => {
    console.log(`  Final result: "${result}"\n`);
    
    demonstrateAsyncIterable();
  });
}

// ========================================
// Part 6: Async Iterators (Modern!)
// ========================================

async function demonstrateAsyncIterable() {
  console.log('🔹 Async Iterators (Modern Approach)');
  console.log('─────────────────────────────────────\n');
  
  const stream = fs.createReadStream(testFile, {
    encoding: 'utf8',
    highWaterMark: 20
  });
  
  console.log('Using for await...of loop:\n');
  
  try {
    let chunkNum = 0;
    for await (const chunk of stream) {
      chunkNum++;
      console.log(`Chunk ${chunkNum}: "${chunk}"`);
    }
    
    console.log('\n✅ Done with async iteration!\n');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
  
  demonstrateReadableOptions();
}

// ========================================
// Part 7: Readable Stream Options
// ========================================

function demonstrateReadableOptions() {
  console.log('🔹 Readable Stream Options');
  console.log('───────────────────────────\n');
  
  console.log('Common options for fs.createReadStream:\n');
  
  console.log('const stream = fs.createReadStream(file, {');
  console.log('  // Encoding');
  console.log('  encoding: "utf8",        // Decode to string');
  console.log('  // or leave undefined for Buffer\n');
  
  console.log('  // Buffer size');
  console.log('  highWaterMark: 64 * 1024, // 64KB (default: 64KB)\n');
  
  console.log('  // File range');
  console.log('  start: 0,                 // Start byte position');
  console.log('  end: 99,                  // End byte position\n');
  
  console.log('  // File descriptor');
  console.log('  fd: null,                 // Use existing file descriptor');
  console.log('  autoClose: true,          // Auto-close file when done\n');
  
  console.log('  // Flags');
  console.log('  flags: "r"                // Read mode');
  console.log('});\n');
  
  demonstratePartialRead();
}

// ========================================
// Part 8: Reading Partial Files
// ========================================

function demonstratePartialRead() {
  console.log('🔹 Reading Partial Files');
  console.log('─────────────────────────\n');
  
  console.log('Reading only bytes 6-19 (first "Hello"):\n');
  
  const partialStream = fs.createReadStream(testFile, {
    encoding: 'utf8',
    start: 6,  // Skip "Line 1"
    end: 19    // Stop after "Hello World"
  });
  
  let partial = '';
  partialStream.on('data', (chunk) => {
    partial += chunk;
  });
  
  partialStream.on('end', () => {
    console.log(`Result: "${partial}"\n`);
    
    printSummary();
  });
}

// ========================================
// Summary
// ========================================

function printSummary() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 Readable Streams Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('✅ Two modes:');
  console.log('   • Flowing: .on("data") - automatic');
  console.log('   • Paused: .on("readable") + .read() - manual\n');
  
  console.log('✅ Control methods:');
  console.log('   • .pause() - pause flowing');
  console.log('   • .resume() - resume flowing');
  console.log('   • .read(size) - read specific amount\n');
  
  console.log('✅ Events:');
  console.log('   • "data" - chunk received');
  console.log('   • "readable" - data available to read');
  console.log('   • "end" - no more data');
  console.log('   • "error" - something went wrong');
  console.log('   • "close" - stream closed\n');
  
  console.log('✅ Modern APIs:');
  console.log('   • Readable.from(iterable) - create from array');
  console.log('   • for await...of - async iteration');
  console.log('   • Custom classes extending Readable\n');
  
  console.log('✅ Options:');
  console.log('   • highWaterMark - buffer size');
  console.log('   • encoding - decode to string');
  console.log('   • start/end - read partial files\n');
  
  console.log('Next: Writable streams! →\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Cleanup
  fs.unlinkSync(testFile);
}
