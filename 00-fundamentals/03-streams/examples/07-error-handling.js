// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Stream Error Handling - Handling Failures Gracefully
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const fs = require('fs');
const { Transform, Readable, Writable, pipeline, finished } = require('stream');
const { promisify } = require('util');
const path = require('path');

const pipelineAsync = promisify(pipeline);
const finishedAsync = promisify(finished);

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('⚠️  Stream Error Handling');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// ========================================
// Part 1: Why Error Handling Matters
// ========================================

console.log('=== 1. Why Error Handling Matters ===\n');

console.log('Common stream errors:');
console.log('─────────────────────\n');

console.log('❌ File not found');
console.log('❌ Permission denied');
console.log('❌ Disk full');
console.log('❌ Network timeout');
console.log('❌ Corrupted data');
console.log('❌ Memory limits\n');

console.log('Without proper error handling:');
console.log('  • Process crashes');
console.log('  • Memory leaks');
console.log('  • Resources not cleaned up');
console.log('  • Silent failures\n');

// ========================================
// Part 2: Basic Error Handling
// ========================================

console.log('=== 2. Basic Error Handling ===\n');

console.log('🔹 Scenario: Read non-existent file\n');

const badStream = fs.createReadStream('/nonexistent/file.txt');

badStream.on('error', (err) => {
  console.log('❌ Error caught!');
  console.log(`   Code: ${err.code}`);
  console.log(`   Message: ${err.message}\n`);
  
  demonstrateWriteError();
});

// Try to read
badStream.on('data', (chunk) => {
  console.log('This will never run');
});

// ========================================
// Part 3: Write Stream Errors
// ========================================

function demonstrateWriteError() {
  console.log('🔹 Scenario: Write to readonly location\n');
  
  const badWrite = fs.createWriteStream('/dev/null/readonly.txt');
  
  badWrite.on('error', (err) => {
    console.log('❌ Write error caught!');
    console.log(`   Code: ${err.code}`);
    console.log(`   Message: ${err.message}\n`);
    
    demonstratePipeErrors();
  });
  
  badWrite.write('This will fail');
}

// ========================================
// Part 4: Errors with .pipe() (Problematic!)
// ========================================

function demonstratePipeErrors() {
  console.log('=== 3. Error Handling with .pipe() ===\n');
  
  console.log('⚠️  Problem: .pipe() does NOT forward errors!\n');
  
  const source = fs.createReadStream('/nonexistent/source.txt');
  const dest = fs.createWriteStream(path.join(__dirname, 'dest.txt'));
  
  console.log('source.pipe(dest);\n');
  
  source.pipe(dest);
  
  // MUST handle errors on EACH stream
  source.on('error', (err) => {
    console.log('❌ Source error:', err.code);
  });
  
  dest.on('error', (err) => {
    console.log('❌ Dest error:', err.code);
  });
  
  setTimeout(() => {
    console.log('\n⚠️  With .pipe(), you need error handlers on EACH stream!');
    console.log('   This gets messy with many streams...\n');
    
    demonstratePipelineErrors();
  }, 100);
}

// ========================================
// Part 5: Pipeline Function (Better!)
// ========================================

async function demonstratePipelineErrors() {
  console.log('=== 4. Error Handling with pipeline() ===\n');
  
  console.log('✅ pipeline() provides centralized error handling\n');
  
  console.log('🔹 Test 1: Missing source file\n');
  
  try {
    await pipelineAsync(
      fs.createReadStream('/nonexistent/file.txt'),
      fs.createWriteStream(path.join(__dirname, 'output.txt'))
    );
  } catch (err) {
    console.log('❌ Error caught in single place!');
    console.log(`   Code: ${err.code}`);
    console.log(`   Message: ${err.message}`);
    console.log('   ✅ All streams automatically cleaned up!\n');
  }
  
  console.log('🔹 Test 2: Transform error\n');
  
  const errorTransform = new Transform({
    transform(chunk, encoding, callback) {
      // Simulate error on 3rd chunk
      if (chunk.toString().includes('ERROR')) {
        callback(new Error('Transform failed!'));
      } else {
        callback(null, chunk);
      }
    }
  });
  
  const testFile = path.join(__dirname, 'test-error.txt');
  fs.writeFileSync(testFile, 'OK\nOK\nERROR\nOK\n');
  
  try {
    await pipelineAsync(
      fs.createReadStream(testFile, { encoding: 'utf8' }),
      errorTransform,
      fs.createWriteStream(path.join(__dirname, 'error-output.txt'))
    );
  } catch (err) {
    console.log('❌ Transform error caught!');
    console.log(`   Message: ${err.message}\n`);
  }
  
  fs.unlinkSync(testFile);
  
  demonstrateCustomErrorHandling();
}

// ========================================
// Part 6: Custom Error Handling
// ========================================

async function demonstrateCustomErrorHandling() {
  console.log('=== 5. Custom Error Handling ===\n');
  
  console.log('Creating custom transform with validation...\n');
  
  class ValidatingTransform extends Transform {
    constructor(options) {
      super(options);
      this.lineNumber = 0;
    }
    
    _transform(chunk, encoding, callback) {
      this.lineNumber++;
      const line = chunk.toString().trim();
      
      // Validate: must be a number
      if (line && isNaN(line)) {
        const err = new Error(`Invalid number at line ${this.lineNumber}: "${line}"`);
        err.lineNumber = this.lineNumber;
        err.value = line;
        return callback(err);
      }
      
      console.log(`  ✅ Line ${this.lineNumber}: ${line || '(empty)'}`);
      callback(null, chunk);
    }
  }
  
  const testFile = path.join(__dirname, 'numbers.txt');
  fs.writeFileSync(testFile, '123\n456\nBAD\n789\n');
  
  console.log('Processing file with numbers...\n');
  
  try {
    await pipelineAsync(
      fs.createReadStream(testFile, { encoding: 'utf8' }),
      new ValidatingTransform(),
      fs.createWriteStream(path.join(__dirname, 'valid-numbers.txt'))
    );
  } catch (err) {
    console.log('\n❌ Validation failed!');
    console.log(`   ${err.message}`);
    console.log(`   At line: ${err.lineNumber}`);
    console.log(`   Invalid value: "${err.value}"\n`);
  }
  
  fs.unlinkSync(testFile);
  
  demonstrateErrorRecovery();
}

// ========================================
// Part 7: Error Recovery
// ========================================

async function demonstrateErrorRecovery() {
  console.log('=== 6. Error Recovery Strategies ===\n');
  
  console.log('Strategy 1: Skip bad data\n');
  
  class SkipErrorsTransform extends Transform {
    constructor(options) {
      super(options);
      this.errors = [];
    }
    
    _transform(chunk, encoding, callback) {
      try {
        const data = JSON.parse(chunk.toString());
        
        // Validate
        if (!data.id || !data.name) {
          throw new Error('Missing required fields');
        }
        
        console.log(`  ✅ Valid:`, data);
        callback(null, JSON.stringify(data) + '\n');
      } catch (err) {
        // Skip this chunk, continue processing
        this.errors.push({
          chunk: chunk.toString(),
          error: err.message
        });
        console.log(`  ⚠️  Skipped invalid data: ${chunk.toString().trim()}`);
        callback(); // No data output, but continue
      }
    }
    
    _flush(callback) {
      console.log(`\n  Summary: ${this.errors.length} errors encountered\n`);
      callback();
    }
  }
  
  const inputFile = path.join(__dirname, 'json-lines.txt');
  fs.writeFileSync(inputFile, 
    '{"id": 1, "name": "Alice"}\n' +
    '{"id": 2}\n' +  // Missing name
    '{"id": 3, "name": "Bob"}\n' +
    'NOT JSON\n' +
    '{"id": 4, "name": "Charlie"}\n'
  );
  
  try {
    await pipelineAsync(
      fs.createReadStream(inputFile, { encoding: 'utf8' }),
      new SkipErrorsTransform(),
      fs.createWriteStream(path.join(__dirname, 'valid-json.txt'))
    );
    
    console.log('✅ Processing complete! Bad data skipped.\n');
  } catch (err) {
    console.log('❌ Unexpected error:', err.message);
  }
  
  fs.unlinkSync(inputFile);
  fs.unlinkSync(path.join(__dirname, 'valid-json.txt'));
  
  demonstrateFinished();
}

// ========================================
// Part 8: stream.finished() Helper
// ========================================

async function demonstrateFinished() {
  console.log('=== 7. stream.finished() Helper ===\n');
  
  console.log('finished() notifies when stream is done or errors\n');
  
  const testFile = path.join(__dirname, 'finished-test.txt');
  fs.writeFileSync(testFile, 'Test data\n');
  
  const stream = fs.createReadStream(testFile);
  
  console.log('Waiting for stream to finish...\n');
  
  try {
    await finishedAsync(stream);
    console.log('✅ Stream finished successfully!\n');
  } catch (err) {
    console.log('❌ Stream ended with error:', err.message);
  }
  
  fs.unlinkSync(testFile);
  
  demonstrateDestroyCleanup();
}

// ========================================
// Part 9: Stream Cleanup with destroy()
// ========================================

function demonstrateDestroyCleanup() {
  console.log('=== 8. Stream Cleanup with destroy() ===\n');
  
  const testFile = path.join(__dirname, 'destroy-test.txt');
  fs.writeFileSync(testFile, 'X'.repeat(10000));
  
  const stream = fs.createReadStream(testFile, {
    highWaterMark: 100
  });
  
  let chunks = 0;
  
  stream.on('data', (chunk) => {
    chunks++;
    
    if (chunks === 3) {
      console.log(`Received ${chunks} chunks, destroying stream...\n`);
      
      // Clean up and stop reading
      stream.destroy();
    }
  });
  
  stream.on('close', () => {
    console.log('✅ Stream closed after destroy()');
    console.log(`   Only processed ${chunks} chunks\n`);
    
    fs.unlinkSync(testFile);
    
    demonstrateAbortController();
  });
  
  stream.on('error', (err) => {
    console.log('Error:', err.message);
  });
}

// ========================================
// Part 10: AbortController (Node 15+)
// ========================================

async function demonstrateAbortController() {
  console.log('=== 9. AbortController (Modern Approach) ===\n');
  
  const testFile = path.join(__dirname, 'abort-test.txt');
  fs.writeFileSync(testFile, 'X'.repeat(10000));
  
  const controller = new AbortController();
  const { signal } = controller;
  
  console.log('Starting stream with AbortController...\n');
  
  setTimeout(() => {
    console.log('⏰ Timeout! Aborting stream...\n');
    controller.abort();
  }, 100);
  
  try {
    await pipelineAsync(
      fs.createReadStream(testFile, { signal }),
      fs.createWriteStream(path.join(__dirname, 'abort-output.txt'), { signal })
    );
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('✅ Stream aborted cleanly!');
      console.log('   All resources cleaned up\n');
    } else {
      console.log('❌ Unexpected error:', err.message);
    }
  }
  
  fs.unlinkSync(testFile);
  try { fs.unlinkSync(path.join(__dirname, 'abort-output.txt')); } catch {}
  
  printSummary();
}

// ========================================
// Summary
// ========================================

function printSummary() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 Stream Error Handling Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('✅ Always handle errors:');
  console.log('   stream.on("error", (err) => {');
  console.log('     // Handle error');
  console.log('   });\n');
  
  console.log('✅ Use pipeline() for centralized handling:');
  console.log('   pipeline(s1, s2, s3, (err) => {');
  console.log('     if (err) {');
  console.log('       // One place for all errors');
  console.log('       // Auto cleanup!');
  console.log('     }');
  console.log('   });\n');
  
  console.log('✅ With promises:');
  console.log('   const pipeline = promisify(require("stream").pipeline);');
  console.log('   try {');
  console.log('     await pipeline(s1, s2, s3);');
  console.log('   } catch (err) {');
  console.log('     // Handle error');
  console.log('   }\n');
  
  console.log('✅ Error recovery strategies:');
  console.log('   • Skip bad data (continue processing)');
  console.log('   • Retry operations');
  console.log('   • Fallback to alternative');
  console.log('   • Log and continue\n');
  
  console.log('✅ Cleanup:');
  console.log('   • stream.destroy() - stop and cleanup');
  console.log('   • stream.finished() - wait for completion');
  console.log('   • AbortController - abort multiple streams\n');
  
  console.log('✅ Best practices:');
  console.log('   • ALWAYS add error listeners');
  console.log('   • Use pipeline() over .pipe()');
  console.log('   • Clean up resources on error');
  console.log('   • Provide meaningful error messages');
  console.log('   • Test error paths!\n');
  
  console.log('✅ Common errors to handle:');
  console.log('   • ENOENT - File not found');
  console.log('   • EACCES - Permission denied');
  console.log('   • ENOSPC - Disk full');
  console.log('   • ETIMEDOUT - Network timeout\n');
  
  console.log('All examples complete! 🎉\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}
