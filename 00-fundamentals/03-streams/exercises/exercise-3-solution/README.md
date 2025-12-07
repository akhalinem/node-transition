# Exercise 3: HTTP File Upload with Streams

A complete HTTP file upload implementation demonstrating Node.js streams, real-time progress tracking, checksum verification, and robust error handling.

## ✨ Features Implemented

### Core Features

- ✅ **Streaming Upload**: Memory-efficient file uploads using Node.js streams
- ✅ **Real-time Progress**: Server-Sent Events (SSE) for live upload progress
- ✅ **Size Validation**: Configurable max file size with early rejection
- ✅ **Checksum Verification**: SHA256 checksums calculated on both client and server
- ✅ **Progress Throttling**: Updates limited to 1% increments to prevent client overload
- ✅ **Upload Cancellation**: Ctrl+C support with graceful cleanup
- ✅ **Retry Logic**: Automatic retry with exponential backoff (1s, 2s, 4s)

### Bonus Features

- ✅ **Pause/Resume Upload**: Press 'p' to pause, run again to resume from exact position
- ✅ **State Persistence**: Upload progress saved to disk
- ✅ **Auto-Resume on Failure**: Network interruptions automatically resume
- ✅ **Checksum Continuity**: SHA256 remains valid across pause/resume cycles

### Additional Features

- Speed calculation (MB/s)
- ETA estimation
- Progress bar visualization
- Detailed error reporting
- Clean file cleanup on errors
- List pending uploads

## 📁 Project Structure

```
exercise-3-solution/
├── http-server.js          # Main upload server
├── progress-transform.js   # Progress tracking transform
├── checksum-transform.js   # SHA256 calculation transform
├── size-validator.js       # File size validation transform
├── test-client.js          # CLI upload client with retry
├── resumable-client.js     # CLI client with pause/resume (NEW!)
├── upload-state.js         # State persistence for resume (NEW!)
├── html-client.html        # Web-based upload UI
├── README.md               # This file
├── PAUSE_RESUME_GUIDE.md   # Pause/resume documentation (NEW!)
├── IMPLEMENTATION_SUMMARY.md
├── ARCHITECTURE.md
└── test-pause-resume.sh    # Test script for pause/resume (NEW!)
```

## 🚀 Usage

### Start the Server

```bash
node http-server.js
```

Server will listen on `http://localhost:3000`

### Upload via CLI Client

```bash
# Basic upload
node test-client.js path/to/file.pdf

# Upload will automatically retry on network errors
# Press Ctrl+C to cancel upload
```

### Upload with Pause/Resume (NEW! ⭐)

```bash
# Start resumable upload
node resumable-client.js path/to/large-file.bin

# During upload:
# - Press 'p' to pause (progress saved)
# - Press Ctrl+C to cancel (progress saved)

# Resume upload (run same command)
node resumable-client.js path/to/large-file.bin

# List all pending uploads
node resumable-client.js --list
```

See **[PAUSE_RESUME_GUIDE.md](./PAUSE_RESUME_GUIDE.md)** for full documentation.

### Upload via Web UI

1. Open `html-client.html` in a browser
2. Click "Choose File" and select a file
3. Click "Upload File"
4. Watch real-time progress updates

### Upload via cURL

```bash
curl -X POST \
  -H "X-Filename: test.txt" \
  --data-binary @path/to/file.txt \
  http://localhost:3000/upload
```

## 🔧 Configuration

### Server Configuration (`http-server.js`)

```javascript
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
const UPLOAD_DIR = "./uploads";
const PORT = 3000;
```

### Client Retry Configuration (`test-client.js`)

```javascript
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
// Exponential backoff: 1s, 2s, 4s
```

## 📊 Progress Updates

The server sends Server-Sent Events (SSE) with the following event types:

### Progress Event

```json
{
  "type": "progress",
  "percent": 45,
  "bytesReceived": 4718592,
  "totalSize": 10485760,
  "speed": "5.23 MB/s",
  "eta": "2s"
}
```

### Complete Event

```json
{
  "type": "complete",
  "filename": "document.pdf",
  "size": 10485760,
  "checksum": "abc123..."
}
```

### Error Event

```json
{
  "type": "error",
  "code": "FILE_TOO_LARGE",
  "message": "File size exceeds limit of 100.00 MB"
}
```

## 🔐 Checksum Verification

Both client and server calculate SHA256 checksums:

1. **Server**: Calculates checksum as file streams through pipeline
2. **Client**: Calculates checksum while uploading
3. **Verification**: Client compares checksums after upload completes

Example output:

```
✅ Upload successful!
   File: document.pdf
   Size: 10.00 MB
   Server SHA256: abc123...
   Client SHA256: abc123...
   ✅ Checksums match! File integrity verified.
```

## 🔄 Retry Logic

The client automatically retries on the following errors:

- `ECONNREFUSED` - Server not running
- `ECONNRESET` - Connection reset
- `ETIMEDOUT` - Request timeout
- `EPIPE` - Broken pipe
- `socket hang up` - Connection closed unexpectedly
- `FILE_TOO_LARGE` - File exceeds size limit (configurable)

**Retry behavior**:

- Max retries: 3
- Backoff delays: 1s → 2s → 4s (exponential)
- Non-retryable errors fail immediately

## 🧪 Testing

### Test 1: Normal Upload

```bash
# Create test file
echo "Hello World" > test.txt

# Upload
node test-client.js test.txt
```

### Test 2: Large File Upload

```bash
# Create 50MB file
dd if=/dev/zero of=large.bin bs=1M count=50

# Upload with progress tracking
node test-client.js large.bin
```

### Test 3: Retry on Connection Failure

```bash
# Start upload WITHOUT server running
node test-client.js test.txt

# Should retry 3 times with exponential backoff
# Then fail with error message
```

### Test 4: Size Validation

```bash
# Create file larger than 100MB limit
dd if=/dev/zero of=too-large.bin bs=1M count=150

# Upload should fail with FILE_TOO_LARGE error
node test-client.js too-large.bin
```

### Test 5: Upload Cancellation

```bash
# Start upload
node test-client.js large.bin

# Press Ctrl+C during upload
# Should cancel gracefully and clean up
```

### Test 6: Checksum Verification

```bash
# Upload file and verify checksums match
node test-client.js document.pdf

# Check server-side file
shasum -a 256 uploads/document.pdf
# Should match both server and client checksums
```

## �️ Stream Pipeline

The server processes uploads through this pipeline:

```
HTTP Request (IncomingMessage)
    ↓
SizeValidator (checks max size)
    ↓
ChecksumTransform (calculates SHA256)
    ↓
ProgressTransform (tracks progress, emits SSE)
    ↓
WriteStream (saves to disk)
```

Each transform:

- Passes data through unchanged
- Performs side effects (validation, tracking, etc.)
- Handles backpressure automatically
- Cleans up on errors

## 🎯 Learning Objectives Covered

1. ✅ **Transform Streams**: Custom transforms for validation, checksums, progress
2. ✅ **Pipeline Composition**: Chaining multiple transforms elegantly
3. ✅ **Backpressure**: Automatic handling via pipeline()
4. ✅ **Error Handling**: Proper cleanup and error propagation
5. ✅ **HTTP Streaming**: Using req/res as streams
6. ✅ **Server-Sent Events**: Real-time updates without WebSockets
7. ✅ **Retry Logic**: Exponential backoff for resilience
8. ✅ **Crypto Streams**: Efficient checksum calculation

## 📚 Key Concepts

### Transform Streams

- Pass data through while processing
- Use `this.push(chunk)` to forward data
- Call `callback()` to signal completion
- Implement `_final()` for cleanup

### Progress Throttling

- Only emit when percentage increases by 1%
- Prevents overwhelming clients with updates
- Maintains smooth progress bar

### Exponential Backoff

```javascript
delay = INITIAL_DELAY * Math.pow(2, retryCount);
// Retry 0: 1s
// Retry 1: 2s
// Retry 2: 4s
```

### Checksum Calculation

```javascript
const hash = crypto.createHash("sha256");
stream.on("data", (chunk) => hash.update(chunk));
stream.on("end", () => {
  const checksum = hash.digest("hex");
});
```

## 🐛 Troubleshooting

**Server won't start**:

```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill process using port
kill -9 <PID>
```

**Upload fails immediately**:

- Ensure server is running
- Check file path is correct
- Verify file exists and is readable

**Progress stuck at 0%**:

- Check server logs for errors
- Verify file size > 0
- Check network connection

**Checksum mismatch**:

- File may have been corrupted during upload
- Check disk space on server
- Retry upload

## 🎓 Next Steps

Consider implementing these bonus features:

- [ ] Pause/resume uploads
- [ ] Multipart uploads for large files
- [ ] Compression (gzip) during upload
- [ ] Authentication/authorization
- [ ] Multiple concurrent uploads
- [ ] Upload queue management
- [ ] Persistent upload history
- [ ] Cloud storage integration (S3, etc.)

## 📖 References

- [Node.js Streams Documentation](https://nodejs.org/api/stream.html)
- [HTTP Module Documentation](https://nodejs.org/api/http.html)
- [Crypto Module Documentation](https://nodejs.org/api/crypto.html)
- [Server-Sent Events Specification](https://html.spec.whatwg.org/multipage/server-sent-events.html)
