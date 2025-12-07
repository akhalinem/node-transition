# Pause/Resume Upload Feature

Complete implementation of pausable/resumable file uploads using Node.js streams.

## 🎯 Features

- ✅ **Pause Upload**: Press 'p' during upload
- ✅ **Resume Upload**: Continues from exact byte position
- ✅ **Auto-Resume on Failure**: Network errors automatically resume
- ✅ **State Persistence**: Upload progress saved to disk
- ✅ **Checksum Continuity**: SHA256 calculation resumes correctly
- ✅ **Stale State Detection**: Automatically cleans up old state (>24h)
- ✅ **List Pending Uploads**: View all incomplete uploads

## 📁 Files

- `upload-state.js` - State persistence management
- `resumable-client.js` - Client with pause/resume support
- `http-server.js` - Server with resume support (updated)
- `progress-transform.js` - Updated to handle resume offset

## 🚀 Usage

### Start Upload

```bash
node resumable-client.js path/to/large-file.bin
```

### During Upload

- **Press `p`** - Pause and save progress
- **Press `Ctrl+C`** - Cancel and save progress

### Resume Upload

Just run the same command again:

```bash
node resumable-client.js path/to/large-file.bin
```

The client automatically detects existing state and resumes!

### List Pending Uploads

```bash
node resumable-client.js --list
```

Output:

```
📋 Pending uploads (2):

1. large-video.mp4
   Path: /Users/you/videos/large-video.mp4
   Progress: 45% (450.00 MB / 1000.00 MB)
   Started: 12/7/2025, 2:30:15 PM

2. backup.tar.gz
   Path: /Users/you/backup.tar.gz
   Progress: 78% (1560.00 MB / 2000.00 MB)
   Started: 12/7/2025, 1:15:42 PM
```

## 🔧 How It Works

### State Persistence

Upload state is saved to `.upload-states/` directory:

```json
{
  "filename": "large-file.bin",
  "bytesUploaded": 524288000,
  "totalSize": 1073741824,
  "serverPath": "large-file.bin",
  "filePath": "/path/to/large-file.bin",
  "timestamp": "2025-12-07T14:30:15.123Z"
}
```

### Resume Flow

```
1. Client checks for existing state
2. If found and valid:
   ├─ Calculate hash of already-uploaded portion
   ├─ Seek to resume position in file
   ├─ Send X-Resume-From header to server
   └─ Continue upload from that byte
3. Server:
   ├─ Open file in append mode ('a' flag)
   ├─ Accept incoming chunks
   └─ Continue writing where it left off
```

### Checksum Continuity

The tricky part is maintaining correct checksums when resuming:

```javascript
// On resume:
1. Read already-uploaded bytes (0 to resumeFrom)
2. Update hash with those bytes
3. Now hash state matches server state
4. Continue hashing new bytes as they upload
5. Final checksum will be correct!
```

## 📊 Example Session

### Initial Upload (Paused at 45%)

```
📤 Uploading: large-file.bin
📏 Size: 1000.00 MB
🔐 Calculating client checksum...

📡 Response status: 200

📊 [██████████████████░░░░░░░░░░░░░░░░░░░░░░] 45% | 12.5 MB/s | ETA: 35s | Press 'p' to pause

[User presses 'p']

⏸️  Upload paused! Progress saved.
   Run the same command again to resume.
```

### Resume Upload

```
node resumable-client.js large-file.bin

🔄 Resuming upload: large-file.bin
📏 Total size: 1000.00 MB
✅ Already uploaded: 45.0% (450.00 MB)
📤 Remaining: 550.00 MB
🔐 Calculating client checksum...
   Restored hash state from 471859200 bytes

📡 Response status: 200

📊 [██████████████████░░░░░░░░░░░░░░░░░░░░░░] 45% | 13.2 MB/s | ETA: 42s | Press 'p' to pause
📊 [████████████████████████░░░░░░░░░░░░░░░░] 60% | 13.8 MB/s | ETA: 29s | Press 'p' to pause
...
📊 [████████████████████████████████████████] 100% | 13.5 MB/s | ETA: 0s

✅ Upload successful!
   File: large-file.bin
   Size: 1000.00 MB
   Server SHA256: a3f5b9e8c2d1...
   Client SHA256: a3f5b9e8c2d1...
   ✅ Checksums match! File integrity verified.

🏁 Upload complete
```

## 🧪 Testing

### Test 1: Basic Pause/Resume

```bash
# Create 100MB test file
dd if=/dev/zero of=test-100mb.bin bs=1M count=100

# Start upload
node resumable-client.js test-100mb.bin

# Press 'p' to pause at ~50%

# Resume
node resumable-client.js test-100mb.bin

# Should continue from 50%
```

### Test 2: Network Interruption

```bash
# Start upload
node resumable-client.js large-file.bin

# In another terminal, stop the server
# Kill the http-server.js process

# Client will fail and save state

# Restart server
node http-server.js

# Resume upload
node resumable-client.js large-file.bin

# Should continue from where it stopped
```

### Test 3: Multiple Paused Uploads

```bash
# Start upload 1
node resumable-client.js file1.bin
# Pause with 'p'

# Start upload 2
node resumable-client.js file2.bin
# Pause with 'p'

# List pending
node resumable-client.js --list

# Resume file1
node resumable-client.js file1.bin

# Resume file2
node resumable-client.js file2.bin
```

### Test 4: Checksum Verification After Resume

```bash
# Calculate original checksum
shasum -a 256 test-file.bin > original.sha256

# Upload with pause
node resumable-client.js test-file.bin
# Pause at 50%

# Resume and complete
node resumable-client.js test-file.bin

# Compare checksums
shasum -a 256 uploads/test-file.bin
cat original.sha256

# Should match!
```

## 🔐 State Security

### State File Location

State files are stored in `.upload-states/` with MD5 hash of file path as filename:

```
.upload-states/
├── a3b5c7d9e1f2a4b6c8d0e2f4.json  # MD5(filePath)
└── f8e6d4c2b0a9e8d7c6b5a4.json
```

### Automatic Cleanup

- **Stale Detection**: States older than 24 hours are ignored
- **Success Cleanup**: State deleted on successful upload
- **Manual Cleanup**: `clearAllStates()` function available

## 💡 Advanced Features

### Programmatic Pause/Resume

```javascript
import { saveState, loadState, clearState, canResume } from "./upload-state.js";

// Check if can resume
if (canResume("./my-file.bin")) {
  const info = getResumeInfo("./my-file.bin");
  console.log(`Can resume from ${info.percentComplete}%`);
}

// Manual state save
saveState("./my-file.bin", {
  filename: "my-file.bin",
  bytesUploaded: 1048576,
  totalSize: 10485760,
  serverPath: "my-file.bin",
});

// Load state
const state = loadState("./my-file.bin");

// Clear state
clearState("./my-file.bin");
```

### Custom Resume Logic

```javascript
// Resume from specific byte position
const resumeFrom = 1048576; // 1 MB

const readStream = fs.createReadStream(filePath, {
  start: resumeFrom,
});

// Send resume header
const options = {
  headers: {
    "X-Filename": filename,
    "X-Resume-From": resumeFrom,
    "Content-Length": totalSize - resumeFrom,
  },
};
```

## ⚠️ Limitations

1. **File Modification**: If file changes after pause, resume fails
2. **Server Restart**: Server doesn't persist state (client does)
3. **File Size**: If file size changes, resume is rejected
4. **Time Limit**: States older than 24h are considered stale

## 🎓 Learning Points

### Key Concepts Demonstrated

1. **Partial File Streaming**: `fs.createReadStream({ start: offset })`
2. **Append Mode Writing**: `fs.createWriteStream({ flags: 'a' })`
3. **Stateful Hashing**: Rebuilding hash state from partial data
4. **HTTP Headers**: Custom headers for metadata (`X-Resume-From`)
5. **Keyboard Input**: Raw mode for 'p' key detection
6. **State Persistence**: JSON file-based state management
7. **Graceful Degradation**: Auto-detect and handle resume scenarios

### Stream Patterns

```javascript
// Reading from offset
fs.createReadStream(file, { start: 1048576 });

// Writing in append mode
fs.createWriteStream(file, { flags: "a" });

// Rebuilding hash state
const hash = crypto.createHash("sha256");
const partialStream = fs.createReadStream(file, { end: offset - 1 });
partialStream.on("data", (chunk) => hash.update(chunk));
// Now continue with new data
```

## 🚀 Production Considerations

For production use, consider adding:

- **Database State Storage**: Instead of JSON files
- **Cloud Storage**: Resume from S3/Azure/GCS
- **Encryption**: Encrypt state files
- **Compression**: Compress during upload
- **Multipart**: Combine with chunked uploads
- **Progress Callback**: Webhook notifications
- **Conflict Resolution**: Handle concurrent resume attempts

## 🏆 Benefits

- **Resilient**: Survives network interruptions
- **User-Friendly**: Can pause intentionally
- **Bandwidth Efficient**: Don't re-upload completed portions
- **Accurate**: Checksums remain valid
- **Transparent**: User sees exactly where resuming from

---

**Status**: ✅ Fully implemented and tested  
**Compatible with**: All existing features (retry, checksum, progress, etc.)
