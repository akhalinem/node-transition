# Exercise 3: HTTP File Upload with Progress

**Difficulty**: ⭐⭐⭐⭐  
**Time**: 60-90 minutes

## Goal

Build an HTTP file upload server and client that:

- Handles large file uploads (GB+) efficiently
- Shows real-time progress
- Supports resume/pause
- Validates file integrity (checksums)
- Handles multiple simultaneous uploads
- All using streams!

## Requirements

### Server Side

Create an HTTP server that:

1. **Accepts file uploads** via POST to `/upload`
2. **Streams directly to disk** (no buffering in memory)
3. **Calculates checksums** during upload (SHA256)
4. **Handles backpressure** from slow disk writes
5. **Validates file size limits**
6. **Provides upload progress** via Server-Sent Events (SSE)
7. **Handles errors gracefully** (network issues, disk full, etc.)

### Client Side

Create a client that:

1. **Uploads files** with streaming
2. **Shows progress** (bytes uploaded, percentage, speed)
3. **Calculates checksum** while uploading
4. **Handles errors** with retry logic
5. **Supports cancellation**

## Task Breakdown

### Part 1: Upload Progress Transform

```javascript
// TODO: Implement ProgressTransform
class ProgressTransform extends Transform {
  constructor(totalSize, onProgress) {
    super();
    this.totalSize = totalSize;
    this.transferred = 0;
    this.onProgress = onProgress;
    this.startTime = Date.now();
  }

  _transform(chunk, encoding, callback) {
    // Update progress
    // Calculate speed (bytes/sec)
    // Estimate time remaining
    // Call onProgress callback
    // Pass chunk through
  }
}
```

### Part 2: Checksum Transform

```javascript
// TODO: Implement ChecksumTransform
class ChecksumTransform extends Transform {
  constructor(algorithm = "sha256") {
    super();
    this.hash = crypto.createHash(algorithm);
  }

  _transform(chunk, encoding, callback) {
    // Update hash
    // Pass chunk through unchanged
  }

  _flush(callback) {
    // Emit checksum
    this.emit("checksum", this.hash.digest("hex"));
    callback();
  }
}
```

### Part 3: Size Validator Transform

```javascript
// TODO: Implement SizeValidator
class SizeValidator extends Transform {
  constructor(maxSize) {
    super();
    this.maxSize = maxSize;
    this.bytesReceived = 0;
  }

  _transform(chunk, encoding, callback) {
    // Check if exceeds max size
    // If exceeded: emit error
    // Otherwise: pass through
  }
}
```

### Part 4: Upload Server

```javascript
const http = require("http");
const fs = require("fs");
const { pipeline } = require("stream");

// TODO: Implement upload server
const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/upload") {
    // Get filename from headers
    const filename = req.headers["x-filename"];
    const filesize = parseInt(req.headers["content-length"]);

    // Create upload pipeline:
    // req → size validator → checksum → progress → file writer

    // Send progress updates via SSE

    // On complete: send checksum back
  }
});
```

### Part 5: Upload Client

```javascript
// TODO: Implement upload client
async function uploadFile(filepath, serverUrl) {
  const filesize = fs.statSync(filepath).size;

  // Create upload pipeline:
  // file reader → progress → checksum → HTTP request

  // Display progress in console

  // Compare checksums

  // Return result
}
```

### Part 6: Progress Display

```javascript
// TODO: Implement progress display
function displayProgress(filename, transferred, total, speed) {
  // Create progress bar
  // Example:
  // Uploading test.bin
  // [████████░░░░░░░░] 45% | 450MB/1GB | 12.5 MB/s | ETA: 45s
}
```

## Server Output Example

```
🚀 Upload server listening on http://localhost:3000

📤 Upload started: large-file.bin (1.2 GB)
   └─ Client: 192.168.1.100

Progress:
  [████░░░░░░░░░░░░] 25% | 300MB/1.2GB | 15.2 MB/s
  [████████░░░░░░░░] 50% | 600MB/1.2GB | 14.8 MB/s
  [████████████░░░░] 75% | 900MB/1.2GB | 15.1 MB/s
  [████████████████] 100% | 1.2GB/1.2GB | 15.0 MB/s

✅ Upload complete: large-file.bin
   SHA256: a3f5b9e8c2d1...
   Duration: 1m 20s
   Avg speed: 15.0 MB/s
```

## Client Output Example

```
Uploading: large-file.bin (1.2 GB)

Progress:
  [████████░░░░░░░░] 50% | 600MB/1.2GB | 14.8 MB/s | ETA: 40s

✅ Upload complete!
   Server checksum: a3f5b9e8c2d1...
   Client checksum: a3f5b9e8c2d1...
   ✅ Checksums match!

Total time: 1m 20s
Average speed: 15.0 MB/s
```

## Bonus Challenges

1. **Multipart Upload**: Split large files into chunks
2. **Resume Upload**: Continue from where left off
3. **Concurrent Chunks**: Upload multiple chunks in parallel
4. **Compression**: Compress before upload, decompress on server
5. **Encryption**: Encrypt uploads end-to-end
6. **Rate Limiting**: Limit upload speed (bandwidth throttling)
7. **Authentication**: Add token-based auth
8. **Multiple Files**: Upload directory with all files
9. **WebSocket Progress**: Use WebSockets instead of SSE
10. **S3 Upload**: Stream directly to AWS S3

## Advanced Features

### Pause/Resume

```javascript
class PausableUpload {
  constructor(filepath) {
    this.filepath = filepath;
    this.paused = false;
    this.bytesUploaded = 0;
  }

  pause() {
    this.paused = true;
    // Save state
  }

  resume() {
    // Resume from saved position
    // Use fs.createReadStream({ start: this.bytesUploaded })
  }
}
```

### Chunk Upload

```javascript
// Split into 10MB chunks
const CHUNK_SIZE = 10 * 1024 * 1024;

async function uploadInChunks(filepath) {
  const filesize = fs.statSync(filepath).size;
  const chunks = Math.ceil(filesize / CHUNK_SIZE);

  for (let i = 0; i < chunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min((i + 1) * CHUNK_SIZE, filesize);

    await uploadChunk(filepath, start, end, i);
  }
}
```

## Files to Create

- `upload-server.js` - HTTP upload server
- `upload-client.js` - Upload client
- `transforms/progress.js` - Progress transform
- `transforms/checksum.js` - Checksum transform
- `transforms/validator.js` - Validation transform
- `utils/progress-bar.js` - Terminal progress display
- `test-upload.js` - Test script

## Testing

### Generate Large Test File

```bash
# Create 100MB test file
dd if=/dev/urandom of=test-100mb.bin bs=1M count=100

# Or use Node.js
node -e "fs.writeFileSync('test.bin', crypto.randomBytes(100 * 1024 * 1024))"
```

### Test Upload

```bash
# Terminal 1: Start server
node upload-server.js

# Terminal 2: Upload file
node upload-client.js test-100mb.bin

# Verify checksums match
shasum -a 256 test-100mb.bin
```

### Stress Test

```bash
# Upload multiple files simultaneously
for i in {1..5}; do
  node upload-client.js test-$i.bin &
done
```

## Error Scenarios to Handle

1. **Network interruption** - Client disconnects mid-upload
2. **Disk full** - Server runs out of space
3. **File too large** - Exceeds size limit
4. **Invalid filename** - Path traversal attempt (`../../etc/passwd`)
5. **Checksum mismatch** - Data corrupted during upload
6. **Slow client** - Backpressure from slow upload
7. **Server restart** - Resume interrupted upload

## Hints

1. Use `pipeline()` for all stream operations
2. Don't buffer the entire file in memory
3. Use `crypto.createHash()` for checksums
4. Sanitize filenames to prevent directory traversal
5. Set appropriate `highWaterMark` for large files
6. Handle `EPIPE` errors (client disconnect)
7. Test with files larger than available RAM

## Common Mistakes to Avoid

- ❌ Buffering entire file in memory
- ❌ Not handling backpressure
- ❌ Blocking event loop with sync operations
- ❌ Not validating/sanitizing filenames
- ❌ Ignoring error events
- ❌ Not cleaning up partial uploads on error
- ❌ Calculating checksum after upload (wastes bandwidth)

## Success Criteria

- ✅ Uploads multi-GB files with < 100MB memory
- ✅ Shows real-time progress
- ✅ Validates checksums correctly
- ✅ Handles errors gracefully
- ✅ Supports concurrent uploads
- ✅ No memory leaks
- ✅ Handles network interruptions

## Memory Challenge

Can you upload a 10GB file while using less than 50MB of memory on both client and server?

This is a real-world exercise! Many production systems need exactly this functionality.

Good luck! 🚀
