// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Streams Basics - Understanding Node.js Streams
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🌊 Node.js Streams - The Foundation');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// ========================================
// Part 1: What are Streams?
// ========================================

console.log('=== 1. What are Streams? ===\n');

console.log('Streams let you process data piece by piece (chunks)');
console.log('instead of loading everything into memory at once.\n');

console.log('📚 Analogy: Reading a book');
console.log('───────────────────────────');
console.log('❌ Without streams: Read the entire book, memorize it, then understand');
console.log('✅ With streams: Read page by page, understand as you go\n');

console.log('💾 Memory Benefits:');
console.log('───────────────────');
console.log('Without streams:');
console.log('  const data = fs.readFileSync("1GB-file.txt"); // Loads 1GB into RAM!');
console.log('  process(data);\n');

console.log('With streams:');
console.log('  const stream = fs.createReadStream("1GB-file.txt"); // Loads chunks');
console.log('  stream.on("data", chunk => process(chunk)); // Process bit by bit\n');

// ========================================
// Part 2: Four Types of Streams
// ========================================

console.log('=== 2. Four Types of Streams ===\n');

console.log('┌─────────────┬──────────────────┬─────────────────────────┐');
console.log('│ Type        │ Direction        │ Examples                │');
console.log('├─────────────┼──────────────────┼─────────────────────────┤');
console.log('│ Readable    │ Source → You     │ Read file, HTTP request │');
console.log('│ Writable    │ You → Destination│ Write file, HTTP respons│');
console.log('│ Duplex      │ Both directions  │ TCP socket, WebSocket   │');
console.log('│ Transform   │ Modify data      │ Compression, encryption │');
console.log('└─────────────┴──────────────────┴─────────────────────────┘\n');

console.log('1. Readable Stream (Read data FROM)');
console.log('────────────────────────────────────');
console.log('  • fs.createReadStream()');
console.log('  • http.IncomingMessage (req)');
console.log('  • process.stdin');
console.log('  • Custom data source\n');

console.log('2. Writable Stream (Write data TO)');
console.log('───────────────────────────────────');
console.log('  • fs.createWriteStream()');
console.log('  • http.ServerResponse (res)');
console.log('  • process.stdout');
console.log('  • Custom data destination\n');

console.log('3. Duplex Stream (Both read and write)');
console.log('───────────────────────────────────────────');
console.log('  • net.Socket');
console.log('  • TCP connections');
console.log('  • WebSocket\n');

console.log('4. Transform Stream (Modify data in transit)');
console.log('──────────────────────────────────────────────');
console.log('  • zlib.createGzip() - Compression');
console.log('  • crypto.createCipheriv() - Encryption');
console.log('  • Custom transformations\n');

// ========================================
// Part 3: Why Use Streams?
// ========================================

console.log('=== 3. Why Use Streams? ===\n');

console.log('✅ Benefit 1: Memory Efficiency');
console.log('────────────────────────────────');
console.log('Process large files without loading all into RAM');
console.log('');
console.log('Example: 10GB video file');
console.log('  Without streams: Need 10GB+ RAM');
console.log('  With streams: Need ~64KB RAM (one chunk)\n');

console.log('✅ Benefit 2: Time Efficiency');
console.log('──────────────────────────────');
console.log('Start processing before all data arrives');
console.log('');
console.log('Example: Download and process file');
console.log('  Without streams: Download 100% → Then process');
console.log('  With streams: Download 10% → Process → Download 10% → Process...\n');

console.log('✅ Benefit 3: Composability');
console.log('────────────────────────────');
console.log('Chain operations together with .pipe()');
console.log('');
console.log('Example:');
console.log('  readStream');
console.log('    .pipe(transformStream)  // Modify data');
console.log('    .pipe(compressStream)   // Compress');
console.log('    .pipe(writeStream);     // Save\n');

// ========================================
// Part 4: Stream Events
// ========================================

console.log('=== 4. Stream Events ===\n');

console.log('Readable Stream Events:');
console.log('───────────────────────');
console.log('  • "data"   - New chunk available');
console.log('  • "end"    - No more data');
console.log('  • "error"  - Something went wrong');
console.log('  • "close"  - Stream closed\n');

console.log('Writable Stream Events:');
console.log('───────────────────────');
console.log('  • "drain"  - Ready to write more');
console.log('  • "finish" - All data written');
console.log('  • "error"  - Something went wrong');
console.log('  • "close"  - Stream closed\n');

// ========================================
// Part 5: Stream Modes
// ========================================

console.log('=== 5. Stream Modes ===\n');

console.log('Readable streams have two modes:\n');

console.log('1. Flowing Mode (Push)');
console.log('──────────────────────');
console.log('Data is automatically pushed to your code');
console.log('');
console.log('stream.on("data", chunk => {');
console.log('  console.log("Got chunk:", chunk);');
console.log('});');
console.log('');
console.log('  • Fast and automatic');
console.log('  • Less control over flow\n');

console.log('2. Paused Mode (Pull)');
console.log('──────────────────────');
console.log('You manually request data when ready');
console.log('');
console.log('stream.on("readable", () => {');
console.log('  let chunk;');
console.log('  while ((chunk = stream.read()) !== null) {');
console.log('    console.log("Got chunk:", chunk);');
console.log('  }');
console.log('});');
console.log('');
console.log('  • More control');
console.log('  • Better for complex logic\n');

// ========================================
// Part 6: Buffering
// ========================================

console.log('=== 6. How Streams Buffer Data ===\n');

console.log('Streams use internal buffers:\n');

console.log('Readable Stream Buffer (highWaterMark: 16KB default)');
console.log('─────────────────────────────────────────────────────');
console.log('┌──────────────────────────────┐');
console.log('│  Internal Buffer (16KB)      │');
console.log('│  ┌─────┬─────┬─────┬─────┐  │  ← Fills from source');
console.log('│  │ Chk │ Chk │ Chk │ Chk │  │');
console.log('│  └─────┴─────┴─────┴─────┘  │');
console.log('└──────────────────────────────┘');
console.log('         ↓');
console.log('    Your code reads\n');

console.log('Writable Stream Buffer (highWaterMark: 16KB default)');
console.log('──────────────────────────────────────────────────────');
console.log('    Your code writes');
console.log('         ↓');
console.log('┌──────────────────────────────┐');
console.log('│  Internal Buffer (16KB)      │');
console.log('│  ┌─────┬─────┬─────┬─────┐  │  → Drains to dest');
console.log('│  │ Chk │ Chk │ Chk │ Chk │  │');
console.log('│  └─────┴─────┴─────┴─────┘  │');
console.log('└──────────────────────────────┘\n');

console.log('When buffer fills up → Backpressure! (we\'ll cover this later)\n');

// ========================================
// Part 7: Common Use Cases
// ========================================

console.log('=== 7. Common Use Cases ===\n');

console.log('📁 File Operations');
console.log('  • Read large log files');
console.log('  • Process CSV data');
console.log('  • Video/audio processing\n');

console.log('🌐 HTTP');
console.log('  • Upload files (multipart)');
console.log('  • Download large files');
console.log('  • Proxy requests\n');

console.log('🗜️ Data Processing');
console.log('  • Compression (gzip)');
console.log('  • Encryption/Decryption');
console.log('  • JSON parsing (large files)\n');

console.log('🔌 Network');
console.log('  • TCP/UDP sockets');
console.log('  • WebSockets');
console.log('  • Database connections\n');

// ========================================
// Part 8: Streams vs Alternatives
// ========================================

console.log('=== 8. When to Use Streams ===\n');

console.log('✅ Use streams when:');
console.log('  • File is larger than available RAM');
console.log('  • Want to start processing ASAP');
console.log('  • Need to transform data in pipeline');
console.log('  • Building real-time systems');
console.log('  • Memory efficiency matters\n');

console.log('❌ Don\'t use streams when:');
console.log('  • File is small (< 1MB)');
console.log('  • Need random access to data');
console.log('  • Simpler code is priority');
console.log('  • Data must be in memory anyway\n');

console.log('Example: When NOT to use streams');
console.log('─────────────────────────────────');
console.log('const config = JSON.parse(fs.readFileSync("config.json"));');
console.log('// Config is small, read all at once is fine!\n');

// ========================================
// Summary
// ========================================

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📝 Key Takeaways');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('✅ Streams process data in chunks (not all at once)');
console.log('✅ Four types: Readable, Writable, Duplex, Transform');
console.log('✅ Memory efficient for large files');
console.log('✅ Time efficient - start processing immediately');
console.log('✅ Composable - chain with .pipe()');
console.log('✅ Event-driven - data, end, error, etc.');
console.log('✅ Two modes - flowing (auto) and paused (manual)');
console.log('✅ Buffering and backpressure prevent overload\n');

console.log('Next: Let\'s see actual code examples! →\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
