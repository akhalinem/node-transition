import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pipeline } from 'node:stream';
import { promisify } from 'node:util';

const pipelineAsync = promisify(pipeline);

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Simple client to test the upload server
 * Usage: node test-client.js <filepath>
 */

const SERVER_URL = 'http://localhost:3000/upload';

async function uploadFile(filePath, retryCount = 0) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(filePath)) {
            reject(new Error(`File not found: ${filePath}`));
            return;
        }

        const filename = path.basename(filePath).trim().replace(/\s+/g, '_');
        const stats = fs.statSync(filePath);
        const fileSize = stats.size;

        if (retryCount > 0) {
            console.log(`\n🔄 Retry attempt ${retryCount}/${MAX_RETRIES}`);
        }

        console.log(`\n📤 Uploading: ${filename}`);
        console.log(`📏 Size: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`🔐 Calculating client checksum...\n`);

        // Calculate client-side checksum
        const clientHash = crypto.createHash('sha256');
        let clientChecksum = null;
        let uploadAborted = false;
        let uploadFailed = false;

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/upload',
            method: 'POST',
            headers: {
                'X-Filename': filename,
                'Content-Length': fileSize
            }
        };

        const req = http.request(options, (res) => {
            console.log(`📡 Response status: ${res.statusCode}\n`);

            let buffer = '';
            let serverChecksum = null;

            res.on('data', (chunk) => {
                buffer += chunk.toString();
                
                // Process SSE events
                const lines = buffer.split('\n');
                buffer = lines.pop(); // Keep incomplete line in buffer

                lines.forEach(line => {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.substring(6));
                            
                            if (data.type === 'progress') {
                                // Create progress bar
                                const percent = data.percent;
                                const barWidth = 40;
                                const filled = Math.round((percent / 100) * barWidth);
                                const empty = barWidth - filled;
                                const bar = '█'.repeat(filled) + '░'.repeat(empty);
                                
                                process.stdout.write(
                                    `\r📊 [${bar}] ${percent}% | ${data.speed} | ETA: ${data.eta}`
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

        // Handle Ctrl+C for cancellation
        const cancelHandler = () => {
            console.log('\n\n⚠️  Upload cancelled by user');
            uploadAborted = true;
            req.destroy();
            process.exit(0);
        };
        process.once('SIGINT', cancelHandler);

        // Stream the file to the server and calculate checksum simultaneously
        const readStream = fs.createReadStream(filePath);
        
        readStream.on('data', (chunk) => {
            clientHash.update(chunk);
        });

        readStream.on('end', () => {
            clientChecksum = clientHash.digest('hex');
        });

        readStream.on('error', (error) => {
            uploadFailed = true;
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
            return; // Success - exit
        } catch (error) {
            // Determine if error is retryable
            const isRetryable = 
                error.code === 'ECONNREFUSED' ||
                error.code === 'ECONNRESET' ||
                error.code === 'ETIMEDOUT' ||
                error.code === 'EPIPE' ||
                error.message.includes('socket hang up') ||
                error.message.includes('FILE_TOO_LARGE');

            if (isRetryable && retryCount < MAX_RETRIES) {
                const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff: 1s, 2s, 4s
                console.error(`\n⚠️  Upload failed: ${error.message}`);
                console.log(`⏳ Retrying in ${delay / 1000} seconds...\n`);
                await sleep(delay);
                retryCount++;
            } else {
                // Non-retryable error or max retries exceeded
                if (retryCount > 0) {
                    console.error(`\n❌ Upload failed after ${retryCount} retries: ${error.message}\n`);
                }
                throw error;
            }
        }
    }
}

// Get file path from command line
const filePath = process.argv[2];

if (!filePath) {
    console.log('Usage: node test-client.js <filepath>');
    console.log('Example: node test-client.js ./test-file.pdf');
    process.exit(1);
}

// Run upload with retry logic
uploadWithRetry(filePath)
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        process.exit(1);
    });
