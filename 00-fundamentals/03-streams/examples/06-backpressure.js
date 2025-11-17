// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Backpressure - Managing Stream Flow
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const fs = require('fs');
const { Writable, Readable, Transform, pipeline } = require('stream');
const { promisify } = require('util');
const path = require('path');

const pipelineAsync = promisify(pipeline);

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('⚡ Backpressure - The Flow Control Mechanism');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// ========================================
// Part 1: What is Backpressure?
// ========================================

console.log('=== 1. What is Backpressure? ===\n');

console.log('Scenario: Fast producer → Slow consumer');
console.log('─────────────────────────────────────────\n');

console.log('Without backpressure (❌ BAD):');
console.log('┌────────────┐      ┌────────────┐');
console.log('│  Producer  │─────→│  Consumer  │');
console.log('│  (Fast!)   │ 💥💥 │  (Slow)    │');
console.log('└────────────┘      └────────────┘');
console.log('     ↓');
console.log('Memory overflow! 💥\n');

console.log('With backpressure (✅ GOOD):');
console.log('┌────────────┐      ┌────────────┐');
console.log('│  Producer  │←─────│  Consumer  │');
console.log('│  (Paused)  │ 🛑   │  (Slow)    │');
console.log('└────────────┘      └────────────┘');
console.log('     "Wait! I\'m full!"\n');

console.log('Key concept: Consumer tells producer to SLOW DOWN\n');

// ========================================
// Part 2: How Backpressure Works
// ========================================

console.log('=== 2. How Backpressure Works ===\n');

console.log('Writable stream has internal buffer:');
console.log('────────────────────────────────────\n');

console.log('Buffer States:');
console.log('┌─────────────────────────────────┐');
console.log('│ Buffer: [    ] (Empty)          │ ✅ write() returns true');
console.log('│ Buffer: [██  ] (Partial)        │ ✅ write() returns true');
console.log('│ Buffer: [████] (Full!)          │ ⚠️  write() returns false');
console.log('└─────────────────────────────────┘\n');

console.log('When buffer fills:');
console.log('  1. write() returns false');
console.log('  2. Producer should STOP writing');
console.log('  3. Wait for "drain" event');
console.log('  4. Resume writing\n');

// ========================================
// Part 3: Demonstrating the Problem
// ========================================

console.log('=== 3. Ignoring Backpressure (Bad!) ===\n');

console.log('Writing without checking return value...\n');

const badFile = path.join(__dirname, 'bad-backpressure.txt');
const badStream = fs.createWriteStream(badFile, {
  highWaterMark: 1024 // Small buffer (1KB)
});

let badWrites = 0;
let falseReturns = 0;

// Spam writes without checking!
console.log('Writing 100 chunks of 512 bytes each...\n');

for (let i = 0; i < 100; i++) {
  const chunk = 'X'.repeat(512);
  const ok = badStream.write(chunk);
  badWrites++;
  
  if (!ok) {
    falseReturns++;
  }
}

console.log(`❌ Wrote ${badWrites} chunks without waiting`);
console.log(`   write() returned false ${falseReturns} times`);
console.log(`   BUT we ignored it and kept writing!\n`);
console.log('Result: Memory builds up, potential crash! 💥\n');

badStream.end(() => {
  fs.unlinkSync(badFile);
  demonstrateCorrectBackpressure();
});

// ========================================
// Part 4: Handling Backpressure Correctly
// ========================================

function demonstrateCorrectBackpressure() {
  console.log('=== 4. Handling Backpressure (Good!) ===\n');
  
  const goodFile = path.join(__dirname, 'good-backpressure.txt');
  const goodStream = fs.createWriteStream(goodFile, {
    highWaterMark: 1024 // 1KB buffer
  });
  
  let goodWrites = 0;
  let drainEvents = 0;
  const totalChunks = 100;
  
  console.log('Writing with proper backpressure handling...\n');
  
  goodStream.on('drain', () => {
    drainEvents++;
    console.log(`  🚰 Drain event #${drainEvents} - resuming writes`);
    writeChunks();
  });
  
  function writeChunks() {
    let ok = true;
    
    while (goodWrites < totalChunks && ok) {
      const chunk = 'X'.repeat(512);
      ok = goodStream.write(chunk);
      goodWrites++;
      
      if (!ok) {
        console.log(`  ⚠️  Buffer full at write #${goodWrites} - pausing`);
      }
    }
    
    if (goodWrites >= totalChunks) {
      console.log(`\n✅ Wrote all ${goodWrites} chunks responsibly!`);
      console.log(`   Paused ${drainEvents} times for backpressure\n`);
      
      goodStream.end(() => {
        fs.unlinkSync(goodFile);
        demonstrateReadableBackpressure();
      });
    }
  }
  
  writeChunks();
}

// ========================================
// Part 5: Backpressure in Readable Streams
// ========================================

function demonstrateReadableBackpressure() {
  console.log('=== 5. Backpressure in Readable Streams ===\n');
  
  console.log('Readable streams can also experience backpressure\n');
  
  // Fast readable stream
  let readCount = 0;
  const fastReader = new Readable({
    highWaterMark: 1024,
    read() {
      if (readCount < 50) {
        const chunk = `Chunk ${++readCount}\n`;
        console.log(`  📖 Pushing chunk ${readCount}`);
        const ok = this.push(chunk);
        
        if (!ok) {
          console.log(`  ⚠️  Internal buffer full! (push returned false)`);
          console.log(`     Will wait for consumer to read before pushing more\n`);
        }
      } else {
        this.push(null); // End stream
      }
    }
  });
  
  // Slow consumer
  let consumeCount = 0;
  fastReader.on('data', (chunk) => {
    consumeCount++;
    // Simulate slow processing (only log first few)
    if (consumeCount <= 5) {
      console.log(`  ✅ Consumed: ${chunk.toString().trim()}`);
    }
  });
  
  fastReader.on('end', () => {
    console.log(`\n✅ Read all ${consumeCount} chunks`);
    console.log('   Backpressure prevented buffer overflow!\n');
    
    demonstratePipeBackpressure();
  });
}

// ========================================
// Part 6: Pipe Automatically Handles Backpressure
// ========================================

function demonstratePipeBackpressure() {
  console.log('=== 6. Pipe Handles Backpressure Automatically ===\n');
  
  console.log('When you use .pipe(), backpressure is handled for you!\n');
  
  const inputFile = path.join(__dirname, 'pipe-input.txt');
  const outputFile = path.join(__dirname, 'pipe-output.txt');
  
  // Create large file
  const largeData = 'X'.repeat(1024 * 100); // 100KB
  fs.writeFileSync(inputFile, largeData);
  
  console.log(`Input size: ${largeData.length} bytes\n`);
  
  const reader = fs.createReadStream(inputFile, {
    highWaterMark: 1024 // Read 1KB at a time
  });
  
  const writer = fs.createWriteStream(outputFile, {
    highWaterMark: 512 // Write buffer is SMALLER (creates backpressure)
  });
  
  let pauseCount = 0;
  
  reader.on('pause', () => {
    pauseCount++;
  });
  
  reader.on('resume', () => {
    console.log(`  ▶️  Reader resumed (pause #${pauseCount})`);
  });
  
  console.log('Piping with automatic backpressure...\n');
  
  reader.pipe(writer);
  
  writer.on('finish', () => {
    console.log('\n✅ Pipe complete!');
    console.log(`   Reader was paused ${pauseCount} times due to backpressure`);
    console.log('   .pipe() handled it automatically! 🎉\n');
    
    // Cleanup
    fs.unlinkSync(inputFile);
    fs.unlinkSync(outputFile);
    
    demonstrateManualBackpressure();
  });
}

// ========================================
// Part 7: Manual Backpressure Handling
// ========================================

function demonstrateManualBackpressure() {
  console.log('=== 7. Manual Backpressure (Without Pipe) ===\n');
  
  const inputFile = path.join(__dirname, 'manual-input.txt');
  const outputFile = path.join(__dirname, 'manual-output.txt');
  
  fs.writeFileSync(inputFile, 'Data\n'.repeat(100));
  
  const reader = fs.createReadStream(inputFile, {
    highWaterMark: 16
  });
  
  const writer = fs.createWriteStream(outputFile, {
    highWaterMark: 8 // Smaller = more backpressure
  });
  
  console.log('Manually handling backpressure...\n');
  
  let drains = 0;
  
  reader.on('data', (chunk) => {
    const ok = writer.write(chunk);
    
    if (!ok) {
      console.log('  ⚠️  Write buffer full - pausing reader');
      reader.pause();
    }
  });
  
  writer.on('drain', () => {
    drains++;
    console.log(`  🚰 Drain event #${drains} - resuming reader`);
    reader.resume();
  });
  
  reader.on('end', () => {
    writer.end(() => {
      console.log(`\n✅ Manual backpressure handling complete!`);
      console.log(`   Handled ${drains} drain events\n`);
      
      // Cleanup
      fs.unlinkSync(inputFile);
      fs.unlinkSync(outputFile);
      
      demonstrateBackpressureMetrics();
    });
  });
}

// ========================================
// Part 8: Monitoring Backpressure
// ========================================

function demonstrateBackpressureMetrics() {
  console.log('=== 8. Monitoring Backpressure ===\n');
  
  const writer = fs.createWriteStream(path.join(__dirname, 'metrics.txt'), {
    highWaterMark: 1024
  });
  
  console.log('Writable stream properties:');
  console.log('───────────────────────────\n');
  
  function logMetrics(label) {
    console.log(`${label}:`);
    console.log(`  writableLength: ${writer.writableLength} bytes (current buffer)`);
    console.log(`  writableHighWaterMark: ${writer.writableHighWaterMark} bytes (max)`);
    console.log(`  writableNeedDrain: ${writer.writableNeedDrain}`);
    
    const percentage = (writer.writableLength / writer.writableHighWaterMark * 100).toFixed(1);
    console.log(`  Buffer fullness: ${percentage}%\n`);
  }
  
  logMetrics('Initial state');
  
  // Write some data
  writer.write('X'.repeat(512));
  logMetrics('After 512 bytes');
  
  writer.write('X'.repeat(512));
  logMetrics('After 1024 bytes');
  
  writer.write('X'.repeat(512));
  logMetrics('After 1536 bytes (overflow!)');
  
  writer.end(() => {
    fs.unlinkSync(path.join(__dirname, 'metrics.txt'));
    printSummary();
  });
}

// ========================================
// Summary
// ========================================

function printSummary() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 Backpressure Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('✅ What is backpressure?');
  console.log('   Flow control mechanism to prevent memory overflow');
  console.log('   when producer is faster than consumer\n');
  
  console.log('✅ How it works:');
  console.log('   1. Writable stream has internal buffer');
  console.log('   2. write() returns false when buffer full');
  console.log('   3. Producer should stop writing');
  console.log('   4. Wait for "drain" event');
  console.log('   5. Resume writing\n');
  
  console.log('✅ Correct pattern:');
  console.log('   function write() {');
  console.log('     let ok = true;');
  console.log('     while (hasMore && ok) {');
  console.log('       ok = stream.write(data);');
  console.log('     }');
  console.log('     if (!ok) {');
  console.log('       stream.once("drain", write);');
  console.log('     }');
  console.log('   }\n');
  
  console.log('✅ Using .pipe():');
  console.log('   • Automatically handles backpressure');
  console.log('   • Pauses readable when writable is full');
  console.log('   • Resumes when drain event fires');
  console.log('   • RECOMMENDED for most cases!\n');
  
  console.log('✅ Monitoring:');
  console.log('   • writableLength - current buffer size');
  console.log('   • writableHighWaterMark - max buffer size');
  console.log('   • writableNeedDrain - true if should wait\n');
  
  console.log('✅ Key takeaway:');
  console.log('   ALWAYS check write() return value!');
  console.log('   Or use .pipe() / pipeline() and let Node.js handle it\n');
  
  console.log('Next: Error handling! →\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}
