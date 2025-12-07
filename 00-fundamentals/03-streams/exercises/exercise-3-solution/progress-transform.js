import { Transform } from 'node:stream';

export class ProgressTransform extends Transform {
    constructor(totalBytes, resumeFromBytes = 0, onProgress, options) {
        super(options);
        this.totalBytes = totalBytes;
        this.resumeFromBytes = resumeFromBytes; // Bytes already uploaded
        this.transferredBytes = resumeFromBytes; // Start from resume point
        this.onProgress = onProgress;
        this.startTime = Date.now();
        this.lastReportedPercent = Math.floor((resumeFromBytes / totalBytes) * 100); // Start from current percentage
    }

    _transform(chunk, encoding, callback) {
        // Update progress
        // Calculate speed (bytes/sec)
        // Estimate time remaining
        // Call onProgress callback
        // Pass chunk through

        this.transferredBytes += chunk.length;
        const elapsedTime = (Date.now() - this.startTime) / 1000; // seconds
        const bytesThisSession = this.transferredBytes - this.resumeFromBytes;
        const speed = bytesThisSession / elapsedTime; // bytes/sec for current session
        const remainingBytes = this.totalBytes - this.transferredBytes;
        const estimatedTimeRemaining = speed > 0 ? (remainingBytes / speed) : 0;
        
        // Calculate current percentage
        const currentPercent = Math.floor((this.transferredBytes / this.totalBytes) * 100);
        
        // Only send progress update if percentage increased by at least 1%
        if (currentPercent > this.lastReportedPercent || this.transferredBytes === this.totalBytes) {
            this.lastReportedPercent = currentPercent;
            
            this.onProgress({
                transferredBytes: this.transferredBytes,
                totalBytes: this.totalBytes,
                speed,
                estimatedTimeRemaining
            });
        }

        this.push(chunk);
        callback();
    }
}
