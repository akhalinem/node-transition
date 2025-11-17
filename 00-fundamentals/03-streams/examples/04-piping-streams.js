// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Piping Streams - Connecting Streams Together
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const fs = require('fs');
const { pipeline, Transform } = require('stream');
const { promisify } = require('util');
const path = require('path');
const zlib = require('zlib');

const pipelineAsync = promisify(pipeline);

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔗 Piping Streams');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// ========================================
// Part 1: Basic Piping
// ========================================

console.log('=== 1. Basic Piping ===\n');

console.log('Concept: Connect readable → writable');
console.log('────────────────────────────────────\n');

console.log('Without pipe:');
console.log('  readStream.on("data", chunk => {');
console.log('    writeStream.write(chunk);');
console.log('  });');
console.log('  readStream.on("end", () => {');
console.log('    writeStream.end();');
console.log('  });\n');

console.log('With pipe:');
console.log('  readStream.pipe(writeStream);\n');

console.log('Benefits:');
console.log('  ✅ Automatic backpressure handling');
console.log('  ✅ Auto-end destination');
console.log('  ✅ Error propagation');
console.log('  ✅ Cleaner code\n');

// Create test files
const sourceFile = path.join(__dirname, 'source.txt');
const destFile = path.join(__dirname, 'destination.txt');

fs.writeFileSync(sourceFile, 'Line 1\nLine 2\nLine 3\n');

console.log('Example: Copy file with pipe\n');

const readStream = fs.createReadStream(sourceFile);
const writeStream = fs.createWriteStream(destFile);

readStream.pipe(writeStream);

writeStream.on('finish', () => {
  console.log('✅ File copied!\n');
  
  const content = fs.readFileSync(destFile, 'utf8');
  console.log('Destination content:');
  console.log(content);
  
  demonstrateChaining();
});

// ========================================
// Part 2: Chaining Multiple Streams
// ========================================

function demonstrateChaining() {
  console.log('=== 2. Chaining Multiple Streams ===\n');
  
  console.log('Create a pipeline: read → transform → compress → write\n');
  
  const inputFile = path.join(__dirname, 'input.txt');
  const compressedFile = path.join(__dirname, 'output.txt.gz');
  
  // Create larger input file
  const data = 'Hello World!\n'.repeat(100);
  fs.writeFileSync(inputFile, data);
  
  console.log(`Input size: ${data.length} bytes\n`);
  
  // Transform stream to uppercase
  const uppercase = new Transform({
    transform(chunk, encoding, callback) {
      this.push(chunk.toString().toUpperCase());
      callback();
    }
  });
  
  // Chain: read → uppercase → gzip → write
  fs.createReadStream(inputFile)
    .pipe(uppercase)
    .pipe(zlib.createGzip())
    .pipe(fs.createWriteStream(compressedFile))
    .on('finish', () => {
      const stats = fs.statSync(compressedFile);
      console.log(`✅ Compressed file created!`);
      console.log(`   Output size: ${stats.size} bytes`);
      console.log(`   Compression: ${((1 - stats.size / data.length) * 100).toFixed(1)}%\n`);
      
      demonstrateUnpipe();
    });
}

// ========================================
// Part 3: Unpipe and Pipe Events
// ========================================

function demonstrateUnpipe() {
  console.log('=== 3. Unpipe and Control ===\n');
  
  const source = fs.createReadStream(sourceFile, {
    highWaterMark: 10
  });
  const dest1 = fs.createWriteStream(path.join(__dirname, 'dest1.txt'));
  const dest2 = fs.createWriteStream(path.join(__dirname, 'dest2.txt'));
  
  console.log('Piping to two destinations...\n');
  
  source.pipe(dest1);
  source.pipe(dest2);
  
  dest1.on('pipe', (src) => {
    console.log('📨 dest1 received "pipe" event');
  });
  
  dest2.on('pipe', (src) => {
    console.log('📨 dest2 received "pipe" event\n');
  });
  
  // Unpipe after 50ms
  setTimeout(() => {
    console.log('⚡ Unpiping dest1...\n');
    source.unpipe(dest1);
    
    dest1.on('unpipe', (src) => {
      console.log('📤 dest1 received "unpipe" event\n');
    });
  }, 50);
  
  source.on('end', () => {
    console.log('✅ Source stream ended\n');
    
    setTimeout(() => {
      const content1 = fs.readFileSync(path.join(__dirname, 'dest1.txt'), 'utf8');
      const content2 = fs.readFileSync(path.join(__dirname, 'dest2.txt'), 'utf8');
      
      console.log('dest1 (unpiped early):');
      console.log(`  "${content1}"\n`);
      
      console.log('dest2 (received all):');
      console.log(`  "${content2}"\n`);
      
      // Cleanup
      fs.unlinkSync(path.join(__dirname, 'dest1.txt'));
      fs.unlinkSync(path.join(__dirname, 'dest2.txt'));
      
      demonstratePipelineFunction();
    }, 100);
  });
}

// ========================================
// Part 4: Pipeline Function (Recommended!)
// ========================================

async function demonstratePipelineFunction() {
  console.log('=== 4. pipeline() Function (Best Practice) ===\n');
  
  console.log('Why pipeline() is better than .pipe():');
  console.log('───────────────────────────────────────\n');
  
  console.log('❌ .pipe() problems:');
  console.log('   • No centralized error handling');
  console.log('   • Stream cleanup is manual');
  console.log('   • Memory leaks if errors not handled\n');
  
  console.log('✅ pipeline() benefits:');
  console.log('   • Single error handler');
  console.log('   • Auto cleanup on error');
  console.log('   • Callback or Promise API\n');
  
  console.log('Example: Safe file compression\n');
  
  const input = path.join(__dirname, 'pipeline-input.txt');
  const output = path.join(__dirname, 'pipeline-output.txt.gz');
  
  fs.writeFileSync(input, 'Test data for pipeline\n'.repeat(50));
  
  try {
    await pipelineAsync(
      fs.createReadStream(input),
      zlib.createGzip(),
      fs.createWriteStream(output)
    );
    
    console.log('✅ Pipeline completed successfully!\n');
    
    const stats = fs.statSync(output);
    console.log(`Compressed size: ${stats.size} bytes\n`);
    
    // Cleanup
    fs.unlinkSync(input);
    fs.unlinkSync(output);
    
    demonstratePipelineError();
  } catch (err) {
    console.error('❌ Pipeline failed:', err.message);
  }
}

// ========================================
// Part 5: Pipeline Error Handling
// ========================================

async function demonstratePipelineError() {
  console.log('=== 5. Pipeline Error Handling ===\n');
  
  console.log('Scenario: Read from non-existent file\n');
  
  try {
    await pipelineAsync(
      fs.createReadStream('/nonexistent/file.txt'),
      fs.createWriteStream(path.join(__dirname, 'error-output.txt'))
    );
  } catch (err) {
    console.log('❌ Error caught in pipeline:');
    console.log(`   Code: ${err.code}`);
    console.log(`   Message: ${err.message}\n`);
    
    console.log('✅ All streams automatically cleaned up!\n');
  }
  
  demonstrateCustomTransform();
}

// ========================================
// Part 6: Custom Transform in Pipeline
// ========================================

async function demonstrateCustomTransform() {
  console.log('=== 6. Custom Transform in Pipeline ===\n');
  
  const input = path.join(__dirname, 'transform-input.txt');
  const output = path.join(__dirname, 'transform-output.txt');
  
  fs.writeFileSync(input, 'hello world\nnode js\nstreams rock\n');
  
  console.log('Creating transform: lowercase → UPPERCASE\n');
  
  const toUpperCase = new Transform({
    transform(chunk, encoding, callback) {
      const upper = chunk.toString().toUpperCase();
      console.log(`  Transforming: "${chunk.toString().trim()}" → "${upper.trim()}"`);
      this.push(upper);
      callback();
    }
  });
  
  try {
    await pipelineAsync(
      fs.createReadStream(input, { encoding: 'utf8' }),
      toUpperCase,
      fs.createWriteStream(output)
    );
    
    console.log('\n✅ Transform complete!\n');
    
    const result = fs.readFileSync(output, 'utf8');
    console.log('Output:');
    console.log(result);
    
    // Cleanup
    fs.unlinkSync(input);
    fs.unlinkSync(output);
    
    demonstrateMultipleTransforms();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

// ========================================
// Part 7: Multiple Transforms
// ========================================

async function demonstrateMultipleTransforms() {
  console.log('=== 7. Multiple Transforms in Pipeline ===\n');
  
  const input = path.join(__dirname, 'multi-input.txt');
  const output = path.join(__dirname, 'multi-output.txt');
  
  fs.writeFileSync(input, 'Line 1\nLine 2\nLine 3\n');
  
  console.log('Pipeline: read → uppercase → add numbers → write\n');
  
  // Transform 1: Uppercase
  const uppercase = new Transform({
    transform(chunk, encoding, callback) {
      this.push(chunk.toString().toUpperCase());
      callback();
    }
  });
  
  // Transform 2: Add line numbers
  let lineNum = 0;
  const addLineNumbers = new Transform({
    transform(chunk, encoding, callback) {
      const lines = chunk.toString().split('\n');
      const numbered = lines
        .map(line => line ? `${++lineNum}. ${line}` : '')
        .join('\n');
      this.push(numbered);
      callback();
    }
  });
  
  try {
    await pipelineAsync(
      fs.createReadStream(input, { encoding: 'utf8' }),
      uppercase,
      addLineNumbers,
      fs.createWriteStream(output)
    );
    
    console.log('✅ Pipeline complete!\n');
    
    const result = fs.readFileSync(output, 'utf8');
    console.log('Result:');
    console.log(result);
    
    // Cleanup
    fs.unlinkSync(input);
    fs.unlinkSync(output);
    
    demonstratePipeOptions();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

// ========================================
// Part 8: Pipe Options
// ========================================

function demonstratePipeOptions() {
  console.log('=== 8. Pipe Options ===\n');
  
  console.log('readableStream.pipe(writableStream, options);\n');
  
  console.log('Options:');
  console.log('────────\n');
  
  console.log('• end: boolean (default: true)');
  console.log('  Controls whether destination is ended when source ends\n');
  
  console.log('  { end: true }  → auto-end destination');
  console.log('  { end: false } → keep destination open\n');
  
  const source1 = fs.createReadStream(sourceFile);
  const dest = fs.createWriteStream(path.join(__dirname, 'multi-source.txt'));
  
  console.log('Example: Multiple sources to one destination\n');
  
  // First source - don't end destination
  source1.pipe(dest, { end: false });
  
  source1.on('end', () => {
    console.log('✅ First source done');
    
    // Second source - do end destination
    const source2 = fs.createReadStream(sourceFile);
    source2.pipe(dest);
    
    source2.on('end', () => {
      console.log('✅ Second source done\n');
      
      dest.on('finish', () => {
        const content = fs.readFileSync(path.join(__dirname, 'multi-source.txt'), 'utf8');
        console.log('Combined output:');
        console.log(content);
        
        // Cleanup
        fs.unlinkSync(path.join(__dirname, 'multi-source.txt'));
        
        printSummary();
      });
    });
  });
}

// ========================================
// Summary
// ========================================

function printSummary() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 Piping Streams Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('✅ Basic piping:');
  console.log('   readable.pipe(writable)');
  console.log('   • Auto handles backpressure');
  console.log('   • Auto ends destination\n');
  
  console.log('✅ Chaining:');
  console.log('   readable');
  console.log('     .pipe(transform1)');
  console.log('     .pipe(transform2)');
  console.log('     .pipe(writable)\n');
  
  console.log('✅ pipeline() function (RECOMMENDED):');
  console.log('   const { pipeline } = require("stream");');
  console.log('   pipeline(');
  console.log('     source,');
  console.log('     transform,');
  console.log('     destination,');
  console.log('     (err) => { /* handle error */ }');
  console.log('   );\n');
  
  console.log('✅ Benefits:');
  console.log('   • Centralized error handling');
  console.log('   • Auto cleanup on error');
  console.log('   • Promise support with promisify()\n');
  
  console.log('✅ Control:');
  console.log('   • .unpipe() - disconnect streams');
  console.log('   • { end: false } - keep destination open');
  console.log('   • Events: "pipe", "unpipe"\n');
  
  console.log('Next: Transform streams! →\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Cleanup
  try {
    fs.unlinkSync(sourceFile);
    fs.unlinkSync(destFile);
    fs.unlinkSync(path.join(__dirname, 'input.txt'));
    fs.unlinkSync(path.join(__dirname, 'output.txt.gz'));
  } catch (err) {
    // Ignore cleanup errors
  }
}
