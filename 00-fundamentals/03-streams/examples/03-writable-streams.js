// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Writable Streams - Writing Data to Destinations
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const fs = require('fs');
const { Writable } = require('stream');
const path = require('path');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✍️  Writable Streams Deep Dive');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// ========================================
// Part 1: Writing to Files
// ========================================

console.log('=== 1. Basic File Writing ===\n');

const outputFile = path.join(__dirname, 'output.txt');

const writeStream1 = fs.createWriteStream(outputFile);

console.log('Writing data to file...\n');

// .write() returns a boolean
const ok1 = writeStream1.write('Line 1: Hello World\n');
console.log(`write() returned: ${ok1}`);
console.log('  true  = buffer not full, safe to write more');
console.log('  false = buffer full, should wait for "drain"\n');

writeStream1.write('Line 2: Streams are powerful\n');
writeStream1.write('Line 3: Node.js is awesome\n');

// .end() signals we're done writing
writeStream1.end(() => {
  console.log('✅ File write completed!\n');
  
  // Verify the file
  const content = fs.readFileSync(outputFile, 'utf8');
  console.log('File contents:');
  console.log('─────────────');
  console.log(content);
  
  demonstrateBackpressure();
});

// ========================================
// Part 2: Understanding Backpressure
// ========================================

function demonstrateBackpressure() {
  console.log('=== 2. Backpressure (Buffer Management) ===\n');
  
  console.log('What is backpressure?');
  console.log('─────────────────────');
  console.log('When you write faster than the stream can handle,');
  console.log('the internal buffer fills up.\n');
  
  console.log('Scenario: Writing large amounts of data\n');
  
  const largeFile = path.join(__dirname, 'large-output.txt');
  const writeStream2 = fs.createWriteStream(largeFile, {
    highWaterMark: 16 * 1024 // 16KB buffer
  });
  
  let canWrite = true;
  let bytesWritten = 0;
  const targetBytes = 100 * 1024; // 100KB
  
  console.log(`Target: Write ${targetBytes} bytes`);
  console.log(`Buffer size: ${writeStream2.writableHighWaterMark} bytes\n`);
  
  // Handle backpressure
  writeStream2.on('drain', () => {
    console.log('🚰 "drain" event - buffer cleared, can write more');
    canWrite = true;
    writeMore();
  });
  
  function writeMore() {
    while (bytesWritten < targetBytes && canWrite) {
      const chunk = 'X'.repeat(1024); // 1KB chunk
      bytesWritten += chunk.length;
      
      // write() returns false when buffer is full
      canWrite = writeStream2.write(chunk);
      
      if (!canWrite) {
        console.log(`⚠️  Buffer full at ${bytesWritten} bytes - waiting for drain...`);
      }
    }
    
    if (bytesWritten >= targetBytes) {
      console.log(`\n✅ Wrote all ${bytesWritten} bytes!`);
      writeStream2.end(() => {
        console.log('✅ Stream closed\n');
        fs.unlinkSync(largeFile);
        demonstrateCustomWritable();
      });
    }
  }
  
  writeMore();
}

// ========================================
// Part 3: Custom Writable Stream
// ========================================

function demonstrateCustomWritable() {
  console.log('=== 3. Custom Writable Stream ===\n');
  
  console.log('Creating a stream that logs and counts bytes...\n');
  
  class LogStream extends Writable {
    constructor(options) {
      super(options);
      this.bytesWritten = 0;
      this.linesWritten = 0;
    }
    
    // _write is called for each chunk
    _write(chunk, encoding, callback) {
      const str = chunk.toString();
      this.bytesWritten += chunk.length;
      this.linesWritten += (str.match(/\n/g) || []).length;
      
      console.log(`  📝 Wrote ${chunk.length} bytes`);
      console.log(`     Content: "${str.trim()}"`);
      console.log(`     Total: ${this.bytesWritten} bytes, ${this.linesWritten} lines\n`);
      
      // Simulate async operation
      setTimeout(() => {
        callback(); // Signal write complete
      }, 100);
    }
    
    _final(callback) {
      console.log('  🏁 _final called - stream ending');
      console.log(`     Final stats: ${this.bytesWritten} bytes, ${this.linesWritten} lines\n`);
      callback();
    }
  }
  
  const logStream = new LogStream();
  
  logStream.write('First line\n');
  logStream.write('Second line\n');
  logStream.write('Third line\n');
  
  logStream.end(() => {
    console.log('✅ Custom stream finished!\n');
    demonstrateErrorHandling();
  });
}

// ========================================
// Part 4: Error Handling
// ========================================

function demonstrateErrorHandling() {
  console.log('=== 4. Error Handling ===\n');
  
  console.log('🔹 Scenario 1: Write after end\n');
  
  const stream1 = fs.createWriteStream(path.join(__dirname, 'temp1.txt'));
  
  stream1.on('error', (err) => {
    console.log(`❌ Error caught: ${err.message}\n`);
  });
  
  stream1.end('Done!');
  
  // This will cause an error
  try {
    stream1.write('Oops!'); // Can't write after end
  } catch (err) {
    console.log(`❌ Exception: ${err.message}\n`);
  }
  
  setTimeout(() => {
    console.log('🔹 Scenario 2: Writing to readonly location\n');
    
    // Try to write to a readonly path (will fail)
    const stream2 = fs.createWriteStream('/dev/null/invalid');
    
    stream2.on('error', (err) => {
      console.log(`❌ Error caught: ${err.code} - ${err.message}\n`);
      demonstrateStreamDestroy();
    });
    
    stream2.write('This will fail');
  }, 500);
}

// ========================================
// Part 5: Stream Lifecycle & Destroy
// ========================================

function demonstrateStreamDestroy() {
  console.log('=== 5. Stream Lifecycle & Destroy ===\n');
  
  const stream = fs.createWriteStream(path.join(__dirname, 'temp2.txt'));
  
  console.log(`writable: ${stream.writable}`);
  console.log(`writableEnded: ${stream.writableEnded}`);
  console.log(`writableFinished: ${stream.writableFinished}\n`);
  
  stream.write('Some data\n');
  
  console.log('After write():');
  console.log(`  writable: ${stream.writable}`);
  console.log(`  writableEnded: ${stream.writableEnded}\n`);
  
  stream.on('finish', () => {
    console.log('🏁 "finish" event - all data written');
    console.log(`   writableFinished: ${stream.writableFinished}\n`);
  });
  
  stream.on('close', () => {
    console.log('🚪 "close" event - stream closed\n');
    
    // Cleanup
    fs.unlinkSync(path.join(__dirname, 'temp2.txt'));
    
    demonstrateCorking();
  });
  
  stream.end('Final data\n');
  
  console.log('After end():');
  console.log(`  writable: ${stream.writable}`);
  console.log(`  writableEnded: ${stream.writableEnded}\n`);
}

// ========================================
// Part 6: Cork and Uncork (Optimization)
// ========================================

function demonstrateCorking() {
  console.log('=== 6. Cork and Uncork (Performance) ===\n');
  
  console.log('Cork buffers writes until uncork is called\n');
  
  const stream = fs.createWriteStream(path.join(__dirname, 'temp3.txt'));
  
  console.log('Without cork - each write flushes immediately:');
  console.log('─────────────────────────────────────────────\n');
  
  console.time('Without cork');
  stream.write('Line 1\n');
  stream.write('Line 2\n');
  stream.write('Line 3\n');
  console.timeEnd('Without cork');
  
  console.log('\nWith cork - buffer all writes:');
  console.log('───────────────────────────────\n');
  
  console.time('With cork');
  stream.cork(); // Start buffering
  
  stream.write('Line 4\n');
  stream.write('Line 5\n');
  stream.write('Line 6\n');
  
  console.log('All writes buffered...');
  
  // Flush on next tick
  process.nextTick(() => {
    stream.uncork(); // Flush all at once
    console.log('Uncorked - all writes flushed together');
    console.timeEnd('With cork');
    
    stream.end(() => {
      console.log('\n✅ Done!\n');
      fs.unlinkSync(path.join(__dirname, 'temp3.txt'));
      demonstrateOptions();
    });
  });
}

// ========================================
// Part 7: Writable Stream Options
// ========================================

function demonstrateOptions() {
  console.log('=== 7. Writable Stream Options ===\n');
  
  console.log('const stream = fs.createWriteStream(file, {');
  console.log('  // Encoding');
  console.log('  encoding: "utf8",         // Default encoding\n');
  
  console.log('  // Buffer size');
  console.log('  highWaterMark: 16 * 1024, // 16KB (default)\n');
  
  console.log('  // File flags');
  console.log('  flags: "w",               // Write mode');
  console.log('         "a",               // Append mode');
  console.log('         "wx",              // Write, fail if exists\n');
  
  console.log('  // File mode');
  console.log('  mode: 0o666,              // File permissions\n');
  
  console.log('  // Auto close');
  console.log('  autoClose: true,          // Close fd on end/error\n');
  
  console.log('  // Start position');
  console.log('  start: 0                  // Byte position to start');
  console.log('});\n');
  
  printSummary();
}

// ========================================
// Summary
// ========================================

function printSummary() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 Writable Streams Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('✅ Writing methods:');
  console.log('   • .write(chunk) - write data (returns true/false)');
  console.log('   • .end([chunk]) - signal end of writing');
  console.log('   • .cork() - buffer writes');
  console.log('   • .uncork() - flush buffered writes\n');
  
  console.log('✅ Backpressure handling:');
  console.log('   • write() returns false when buffer full');
  console.log('   • Wait for "drain" event before writing more');
  console.log('   • Prevents memory overflow\n');
  
  console.log('✅ Events:');
  console.log('   • "drain" - buffer cleared, ready for more');
  console.log('   • "finish" - end() called, all data written');
  console.log('   • "pipe" - readable stream piped to this');
  console.log('   • "unpipe" - readable stream unpiped');
  console.log('   • "error" - write failed');
  console.log('   • "close" - stream closed\n');
  
  console.log('✅ Properties:');
  console.log('   • .writable - can still write');
  console.log('   • .writableEnded - end() was called');
  console.log('   • .writableFinished - all data written');
  console.log('   • .writableHighWaterMark - buffer size\n');
  
  console.log('✅ Custom streams:');
  console.log('   • Extend Writable class');
  console.log('   • Implement _write(chunk, encoding, callback)');
  console.log('   • Optionally implement _final(callback)\n');
  
  console.log('Next: Piping streams together! →\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Cleanup
  try {
    fs.unlinkSync(outputFile);
    fs.unlinkSync(path.join(__dirname, 'temp1.txt'));
  } catch (err) {
    // Ignore cleanup errors
  }
}
