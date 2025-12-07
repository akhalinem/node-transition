import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import readline from 'node:readline';
import {
    saveState,
    loadState,
    clearState,
    canResume,
    getResumeInfo,
    listPendingUploads
} from './upload-state.js';

/**
 * Resumable upload client with pause/resume support
 * Usage: node resumable-client.js <filepath>
 *        node resumable-client.js --list      (list pending uploads)
 *        node resumable-client.js --resume <filepath>
 */

const SERVER_URL = 'http://localhost:3000/upload';
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate checksum for a portion of file (used for resume)
 */
async function calculatePartialChecksum(filePath, endByte) {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const readStream = fs.createReadStream(filePath, { end: endByte - 1 });
        
        readStream.on('data', (chunk) => {
            hash.update(chunk);
        });
        
        readStream.on('end', () => {
            resolve(hash);
        });
        
        readStream.on('error', reject);
    });
}

async function uploadFile(filePath, retryCount = 0) {
    return new Promise(async (resolve, reject) => {
        if (!fs.existsSync(filePath)) {
            reject(new Error(`File not found: ${filePath}`));
            return;
        }

        const filename = path.basename(filePath).trim().replace(/\s+/g, '_');
        const stats = fs.statSync(filePath);
        const fileSize = stats.size;

        // Check for existing upload state
        const resumeInfo = getResumeInfo(filePath);
        const isResume = resumeInfo !== null;
        const resumeFrom = isResume ? resumeInfo.bytesUploaded : 0;
        const remainingSize = fileSize - resumeFrom;

        if (retryCount > 0) {
            console.log(`\n🔄 Retry attempt ${retryCount}/${MAX_RETRIES}`);
        }

        if (isResume) {
            console.log(`\n🔄 Resuming upload: ${filename}`);
            console.log(`📏 Total size: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
            console.log(`✅ Already uploaded: ${resumeInfo.percentComplete}% (${(resumeFrom / 1024 / 1024).toFixed(2)} MB)`);
            console.log(`📤 Remaining: ${(remainingSize / 1024 / 1024).toFixed(2)} MB`);
            console.log(`🔐 Calculating client checksum...`);
        } else {
            console.log(`\n📤 Uploading: ${filename}`);
            console.log(`📏 Size: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
            console.log(`🔐 Calculating client checksum...\n`);
        }

        // Calculate client-side checksum
        let clientHash;
        
        if (isResume) {
            // Resume hash from already uploaded portion
            clientHash = await calculatePartialChecksum(filePath, resumeFrom);
            console.log(`   Restored hash state from ${resumeFrom} bytes\n`);
        } else {
            clientHash = crypto.createHash('sha256');
        }
        
        let clientChecksum = null;
        let uploadAborted = false;
        let uploadFailed = false;
        let isPaused = false;

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/upload',
            method: 'POST',
            headers: {
                'X-Filename': filename,
                'Content-Length': remainingSize
            }
        };

        // Add resume header if resuming
        if (isResume) {
            options.headers['X-Resume-From'] = resumeFrom;
        }

        const req = http.request(options, (res) => {
            console.log(`📡 Response status: ${res.statusCode}\n`);

            let buffer = '';
            let serverChecksum = null;

            res.on('data', (chunk) => {
                buffer += chunk.toString();
                
                // Process SSE events
                const lines = buffer.split('\n');
                buffer = lines.pop();

                lines.forEach(line => {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.substring(6));
                            
                            if (data.type === 'progress') {
                                // Save state periodically (every 1%)
                                const currentBytes = data.transferred;
                                saveState(filePath, {
                                    filename,
                                    bytesUploaded: currentBytes,
                                    totalSize: fileSize,
                                    serverPath: filename
                                });

                                // Create progress bar
                                const percent = data.percent;
                                const barWidth = 40;
                                const filled = Math.round((percent / 100) * barWidth);
                                const empty = barWidth - filled;
                                const bar = '█'.repeat(filled) + '░'.repeat(empty);
                                
                                process.stdout.write(
                                    `\r📊 [${bar}] ${percent}% | ${data.speed} | ETA: ${data.eta} | Press 'p' to pause`
                                );
                            }
                            else if (data.type === 'complete') {
                                serverChecksum = data.checksum;
                                console.log('\n');
                                console.log('✅ Upload successful!');
                                console.log(`   File: ${data.filename}`);
                                console.log(`   Size: ${(data.size / 1024 / 1024).toFixed(2)} MB`);
                                console.log(`   Server SHA256: ${data.checksum}`);
                                console.log(`   Client SHA256: ${clientChecksum}`);
                                
                                // Verify checksums match
                                if (clientChecksum === serverChecksum) {
                                    console.log(`   ✅ Checksums match! File integrity verified.\n`);
                                    // Clear upload state on success
                                    clearState(filePath);
                                } else {
                                    console.log(`   ❌ Checksum mismatch! File may be corrupted.\n`);
                                }
                            }
                            else if (data.type === 'error') {
                                console.log('\n');
                                console.error(`❌ Upload failed: ${data.message}\n`);
                                uploadFailed = true;
                                reject(new Error(data.message));
                            }
                        } catch (e) {
                            // Ignore JSON parse errors
                        }
                    }
                });
            });

            res.on('end', () => {
                if (!uploadAborted && !uploadFailed) {
                    console.log('🏁 Upload complete\n');
                    resolve();
                }
            });
        });

        req.on('error', (error) => {
            if (!uploadAborted) {
                uploadFailed = true;
                reject(error);
            }
        });

        // Setup keyboard input handling for pause
        readline.emitKeypressEvents(process.stdin);
        if (process.stdin.isTTY) {
            process.stdin.setRawMode(true);
        }

        const keypressHandler = (str, key) => {
            if (key && key.name === 'p') {
                if (!isPaused) {
                    console.log('\n\n⏸️  Upload paused! Progress saved.');
                    console.log('   Run the same command again to resume.');
                    isPaused = true;
                    uploadAborted = true;
                    req.destroy();
                    cleanup();
                    process.exit(0);
                }
            }
            
            if (key && key.ctrl && key.name === 'c') {
                console.log('\n\n❌ Upload cancelled! Progress saved.');
                console.log('   Run the same command again to resume.');
                uploadAborted = true;
                req.destroy();
                cleanup();
                process.exit(0);
            }
        };

        process.stdin.on('keypress', keypressHandler);

        const cleanup = () => {
            process.stdin.removeListener('keypress', keypressHandler);
            if (process.stdin.isTTY) {
                process.stdin.setRawMode(false);
            }
        };

        // Handle Ctrl+C
        const cancelHandler = () => {
            console.log('\n\n⚠️  Upload cancelled - progress saved');
            uploadAborted = true;
            req.destroy();
            cleanup();
            process.exit(0);
        };
        process.once('SIGINT', cancelHandler);

        // Stream the file to the server starting from resume position
        const readStream = fs.createReadStream(filePath, {
            start: resumeFrom // Start reading from resume position
        });
        
        readStream.on('data', (chunk) => {
            clientHash.update(chunk);
        });

        readStream.on('end', () => {
            clientChecksum = clientHash.digest('hex');
            cleanup();
        });

        readStream.on('error', (error) => {
            uploadFailed = true;
            cleanup();
            reject(error);
        });

        readStream.pipe(req);
    });
}

async function uploadWithRetry(filePath) {
    let retryCount = 0;
    
    while (retryCount <= MAX_RETRIES) {
        try {
            await uploadFile(filePath, retryCount);
            return;
        } catch (error) {
            const isRetryable = 
                error.code === 'ECONNREFUSED' ||
                error.code === 'ECONNRESET' ||
                error.code === 'ETIMEDOUT' ||
                error.code === 'EPIPE' ||
                error.message.includes('socket hang up') ||
                error.message.includes('FILE_TOO_LARGE');

            if (isRetryable && retryCount < MAX_RETRIES) {
                const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
                console.error(`\n⚠️  Upload failed: ${error.message}`);
                console.log(`⏳ Retrying in ${delay / 1000} seconds...\n`);
                await sleep(delay);
                retryCount++;
            } else {
                if (retryCount > 0) {
                    console.error(`\n❌ Upload failed after ${retryCount} retries: ${error.message}\n`);
                }
                throw error;
            }
        }
    }
}

function listPending() {
    const uploads = listPendingUploads();
    
    if (uploads.length === 0) {
        console.log('\n📭 No pending uploads\n');
        return;
    }
    
    console.log(`\n📋 Pending uploads (${uploads.length}):\n`);
    
    uploads.forEach((upload, index) => {
        console.log(`${index + 1}. ${upload.filename}`);
        console.log(`   Path: ${upload.filePath}`);
        console.log(`   Progress: ${upload.percentComplete}% (${(upload.bytesUploaded / 1024 / 1024).toFixed(2)} MB / ${(upload.totalSize / 1024 / 1024).toFixed(2)} MB)`);
        console.log(`   Started: ${new Date(upload.timestamp).toLocaleString()}`);
        console.log('');
    });
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
    console.log('\n📝 Usage:');
    console.log('  node resumable-client.js <file-path>');
    console.log('  node resumable-client.js --list');
    console.log('  node resumable-client.js --resume <file-path>');
    console.log('\nExamples:');
    console.log('  node resumable-client.js ./large-file.bin');
    console.log('  node resumable-client.js --list');
    console.log('\nDuring upload:');
    console.log('  Press \'p\' to pause');
    console.log('  Press Ctrl+C to cancel (progress saved)');
    console.log('');
    process.exit(1);
}

if (args[0] === '--list') {
    listPending();
    process.exit(0);
}

const filePath = path.resolve(args[0] === '--resume' ? args[1] : args[0]);

uploadWithRetry(filePath)
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        process.exit(1);
    });
