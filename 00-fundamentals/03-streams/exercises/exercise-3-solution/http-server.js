import http from 'node:http';
import fs from 'node:fs';
import stream from 'node:stream';
import { promisify } from 'node:util';
import path from 'node:path';

import { ProgressTransform } from './progress-transform.js'
import { ChecksumTransform } from './checksum-transform.js'
import { SizeValidator } from './size-validator.js'

const pipelineAsync = promisify(stream.pipeline);
const htmlClient = fs.readFileSync('./html-client.html', 'utf-8');

// Configuration
const UPLOAD_DIR = './uploads';
const MAX_FILE_SIZE = 20 * 1024 * 1024 * 1024; // 20GB
const PORT = 3000;

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const server = http.createServer(async (req, res) => {
    if (req.method === 'POST' && req.url === '/upload') {
        // Get filename from headers
        const filename = req.headers['x-filename'] || `upload-${Date.now()}`;
        const contentLength = parseInt(req.headers['content-length'] || '0');
        const resumeFrom = parseInt(req.headers['x-resume-from'] || '0');
        const isResume = resumeFrom > 0;

        if(isNaN(contentLength)) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid Content-Length header');
            return;
        }

        if (contentLength === 0) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('No file uploaded');
            return;
        }

        const totalSize = isResume ? resumeFrom + contentLength : contentLength;

        if(totalSize > MAX_FILE_SIZE) {
            res.writeHead(413, { 'Content-Type': 'text/plain' });
            res.end('File size exceeds limit');
            return;
        }

        // Sanitize filename - use consistent name for resume
        const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
        const outputPath = path.join(UPLOAD_DIR, sanitizedFilename);

        if (isResume) {
            console.log(`\n🔄 Resuming upload: ${filename}`);
            console.log(`   Already uploaded: ${(resumeFrom / 1024 / 1024).toFixed(2)} MB`);
            console.log(`   Remaining: ${(contentLength / 1024 / 1024).toFixed(2)} MB`);
            console.log(`   Total: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
        } else {
            console.log(`\n📤 Upload started: ${filename} (${(contentLength / 1024 / 1024).toFixed(2)} MB)`);
        }

        // Set up Server-Sent Events for progress updates
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });

        // Create transform streams
        const sizeValidator = new SizeValidator(MAX_FILE_SIZE - resumeFrom); // Adjust for already uploaded
        const checksumTransform = new ChecksumTransform('sha256');
        
        const progressTransform = new ProgressTransform(
            contentLength,
            resumeFrom, // Pass resume offset
            (progress) => {
                // Send progress updates via SSE
                const percent = ((progress.transferredBytes / progress.totalBytes) * 100).toFixed(1);
                const speedMB = (progress.speed / 1024 / 1024).toFixed(2);
                const eta = Math.ceil(progress.estimatedTimeRemaining);
                
                const data = {
                    type: 'progress',
                    percent: parseFloat(percent),
                    transferred: progress.transferredBytes,
                    total: progress.totalBytes,
                    speed: `${speedMB} MB/s`,
                    eta: `${eta}s`
                };
                
                res.write(`data: ${JSON.stringify(data)}\n\n`);
                
                // Also log to console
                console.log(`📊 Progress: ${percent}% | ${speedMB} MB/s | ETA: ${eta}s`);
            }
        );

        // Create write stream - append if resuming, otherwise create new
        const writeStream = fs.createWriteStream(outputPath, {
            flags: isResume ? 'a' : 'w'  // 'a' for append, 'w' for write (overwrite)
        });

        try {
            // Create upload pipeline:
            // req -> size validator -> checksum -> progress -> file writer
            const pipelinePromise = pipelineAsync(
                req,
                sizeValidator,
                checksumTransform,
                progressTransform,
                writeStream
            );

            // Listen for checksum event
            let checksum = null;
            checksumTransform.on('checksum', (hash) => {
                checksum = hash;
            });

            // Wait for pipeline to complete
            await pipelinePromise;

            // Send completion event with checksum
            const fileStats = fs.statSync(outputPath);
            const completionData = {
                type: 'complete',
                filename,
                size: fileStats.size,
                checksum: checksum,
                message: 'Upload completed successfully'
            };
            
            res.write(`data: ${JSON.stringify(completionData)}\n\n`);
            res.end();

            console.log(`✅ Upload complete: ${filename}`);
            console.log(`   Size: ${(fileStats.size / 1024 / 1024).toFixed(2)} MB`);
            console.log(`   SHA256: ${checksum}\n`);

        } catch (error) {
            console.error(`❌ Upload failed: ${error.message}`);
            
            // Send error event
            const errorData = {
                type: 'error',
                message: error.message
            };
            
            res.write(`data: ${JSON.stringify(errorData)}\n\n`);
            res.end();

            // Clean up partial file on error
            if (fs.existsSync(outputPath)) {
                fs.unlinkSync(outputPath);
            }
        }
    } 
    else if (req.method === 'GET' && req.url === '/') {
        // Serve a simple upload form
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(htmlClient);
    }
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`\n🚀 Server running at http://localhost:${PORT}`);
    console.log(`📁 Upload directory: ${path.resolve(UPLOAD_DIR)}`);
    console.log(`📏 Max file size: ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)} MB\n`);
});