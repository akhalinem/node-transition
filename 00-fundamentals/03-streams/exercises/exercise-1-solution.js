import fs from 'fs';
import {Transform,Writable,pipeline,Readable} from 'stream'
import {promisify} from 'util'

const pipelineAsync = promisify(pipeline);
const numberFormatter = new Intl.NumberFormat();

/**
 * Memory monitoring utility
 */
class MemoryMonitor {
    constructor(intervalMs = 1000) {
        this.intervalMs = intervalMs;
        this.interval = null;
        this.samples = [];
        this.startMemory = null;
    }

    start() {
        this.startMemory = process.memoryUsage();
        console.log('📊 Memory Monitor Started\n');
        
        this.interval = setInterval(() => {
            const mem = process.memoryUsage();
            this.samples.push(mem);
            
            const heapUsedMB = (mem.heapUsed / 1024 / 1024).toFixed(2);
            const heapTotalMB = (mem.heapTotal / 1024 / 1024).toFixed(2);
            const rssMB = (mem.rss / 1024 / 1024).toFixed(2);
            const externalMB = (mem.external / 1024 / 1024).toFixed(2);
            
            console.log(`[Memory] RSS: ${rssMB}MB | Heap: ${heapUsedMB}/${heapTotalMB}MB | External: ${externalMB}MB`);
        }, this.intervalMs);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        
        const endMemory = process.memoryUsage();
        this.printSummary(endMemory);
    }

    printSummary(endMemory) {
        if (this.samples.length === 0) return;
        
        // Calculate statistics
        const heapUsedSamples = this.samples.map(s => s.heapUsed);
        const rssSamples = this.samples.map(s => s.rss);
        
        const avgHeapUsed = heapUsedSamples.reduce((a, b) => a + b, 0) / heapUsedSamples.length;
        const maxHeapUsed = Math.max(...heapUsedSamples);
        const minHeapUsed = Math.min(...heapUsedSamples);
        
        const avgRss = rssSamples.reduce((a, b) => a + b, 0) / rssSamples.length;
        const maxRss = Math.max(...rssSamples);
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 MEMORY USAGE SUMMARY');
        console.log('='.repeat(60));
        
        console.log('\n🔹 Heap Memory:');
        console.log(`   Start:   ${(this.startMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   End:     ${(endMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Average: ${(avgHeapUsed / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Min:     ${(minHeapUsed / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Max:     ${(maxHeapUsed / 1024 / 1024).toFixed(2)} MB`);
        
        console.log('\n🔹 RSS (Resident Set Size):');
        console.log(`   Start:   ${(this.startMemory.rss / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   End:     ${(endMemory.rss / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Average: ${(avgRss / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Max:     ${(maxRss / 1024 / 1024).toFixed(2)} MB`);
        
        console.log('\n🔹 External Memory:');
        console.log(`   Start:   ${(this.startMemory.external / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   End:     ${(endMemory.external / 1024 / 1024).toFixed(2)} MB`);
        
        console.log('\n🔹 Array Buffers:');
        console.log(`   Start:   ${(this.startMemory.arrayBuffers / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   End:     ${(endMemory.arrayBuffers / 1024 / 1024).toFixed(2)} MB`);
        
        console.log('\n' + '='.repeat(60) + '\n');
    }

    formatBytes(bytes) {
        return (bytes / 1024 / 1024).toFixed(2);
    }
}

/**
 * Progress bar for stream processing
 */
class ProgressBar {
    constructor(options = {}) {
        this.totalBytes = options.totalBytes || 0;
        this.label = options.label || 'Progress';
        this.width = options.width || 40;
        this.startTime = Date.now();
        this.processedBytes = 0;
        this.processedLines = 0;
        this.interval = null;
        this.updateIntervalMs = options.updateIntervalMs || 500;
    }

    start() {
        this.startTime = Date.now();
        // Update progress bar periodically
        this.interval = setInterval(() => {
            this.render();
        }, this.updateIntervalMs);
    }

    update(bytesProcessed, linesProcessed) {
        this.processedBytes = bytesProcessed;
        this.processedLines = linesProcessed;
    }

    render() {
        const elapsed = (Date.now() - this.startTime) / 1000;
        const percent = this.totalBytes > 0 
            ? Math.min(100, (this.processedBytes / this.totalBytes) * 100)
            : 0;
        
        // Create progress bar
        const filledWidth = Math.round((percent / 100) * this.width);
        const emptyWidth = this.width - filledWidth;
        const bar = '█'.repeat(filledWidth) + '░'.repeat(emptyWidth);
        
        // Calculate speed
        const linesPerSec = elapsed > 0 ? Math.round(this.processedLines / elapsed) : 0;
        const mbProcessed = (this.processedBytes / 1024 / 1024).toFixed(2);
        const mbTotal = (this.totalBytes / 1024 / 1024).toFixed(2);
        
        // Calculate ETA
        const eta = percent > 0 && percent < 100
            ? Math.round((elapsed / percent) * (100 - percent))
            : 0;
        const etaStr = this.formatTime(eta);
        
        // Clear line and write progress
        process.stdout.write('\r\x1b[K'); // Clear current line
        process.stdout.write(
            `${this.label}: [${bar}] ${percent.toFixed(1)}% | ` +
            `${numberFormatter.format(this.processedLines)} lines | ` +
            `${mbProcessed}/${mbTotal}MB | ` +
            `${numberFormatter.format(linesPerSec)} lines/s | ` +
            `ETA: ${etaStr}`
        );
    }

    complete() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        
        // Final render at 100%
        const elapsed = (Date.now() - this.startTime) / 1000;
        const linesPerSec = Math.round(this.processedLines / elapsed);
        
        process.stdout.write('\r\x1b[K'); // Clear current line
        process.stdout.write(
            `${this.label}: [${'█'.repeat(this.width)}] 100.0% | ` +
            `${numberFormatter.format(this.processedLines)} lines | ` +
            `${numberFormatter.format(linesPerSec)} lines/s | ` +
            `Done in ${elapsed.toFixed(2)}s\n`
        );
    }

    formatTime(seconds) {
        if (seconds < 60) return `${seconds}s`;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    }
}

/**
 * A Readable stream that generates log entries.
 */
class ReadableFromGenerator extends Readable {
    _logLevels = [
        { level: 'INFO', weight: 70 },
        { level: 'WARN', weight: 20 },
        { level: 'ERROR', weight: 10 }
    ];

    _getRandomLogLevel() {
        const rand = Math.random() * 100;
        let cumulative = 0;
        for (const logLevel of this._logLevels) {
            cumulative += logLevel.weight;
            if (rand < cumulative) {
                return logLevel.level;
            }
        }
    }

    _getRandomMessage(level) {
        const messages = {
            'INFO': ['Server started', 'User logged in', 'Data processed successfully'],
            'WARN': ['High memory usage detected', 'Disk space running low', 'Retrying connection'],
            'ERROR': ['Database connection failed', 'Unhandled exception occurred', 'Service unavailable']
        };
        const msgs = messages[level];
        return msgs[Math.floor(Math.random() * msgs.length)];
    }

    constructor(lines, options) {
        super(options);
        this.lines = lines;
        this.generated = 0;
    }

    _read() {
        while (this.generated < this.lines) {
            const level = this._getRandomLogLevel();
            const message = this._getRandomMessage(level);
            const timestamp = new Date().toISOString();
            const logLine = `[${timestamp}] [${level}] ${message}\n`;
            if (!this.push(logLine)) {
                return; // Stop pushing if the internal buffer is full
            }
            this.generated++;
        }
        this.push(null);  // Signals "no more data" - ends the stream
    }
}

class LineParser extends Transform {
    constructor(options) {
        super({...options, objectMode: true})
        this.buffer='';
        this.length = 0;
        this.chunkCount = 0;
        this.totalProcessingTime = 0;
        this.startTime = null;
        this.bytesProcessed = 0;
        this.progressBar = options.progressBar || null;
    }

    _transform(chunk, encoding, callback) {
        const chunkStartTime = performance.now();
        
        // Track bytes for progress
        this.bytesProcessed += chunk.length;
        
        // Split  by newlines
        // Parse format: [timestamp] [level] message
        // Push parsed objects

        this.buffer += chunk.toString();
        const lines = this.buffer.split('\n');
        this.buffer = lines.pop(); // Keep the last partial line in buffer
        this.length += lines.length;

        for (const line of lines) {
            if (line.trim()) {
                const match = line.match(/^\[(.+?)\] \[(.+?)\] (.+)$/);
                if (match) {
                    const [, timestamp, level, message] = match;
                    this.push({ timestamp, level, message });
                }
            }
        }
        
        const chunkEndTime = performance.now();
        const chunkDuration = chunkEndTime - chunkStartTime;
        this.totalProcessingTime += chunkDuration;
        this.chunkCount++;
        
        // Update progress bar
        if (this.progressBar) {
            this.progressBar.update(this.bytesProcessed, this.length);
        }
        
        callback();
    }
}

class LogFilter extends Transform {
    constructor(level, options) {
        super({...options, objectMode: true});
        this.targetLevel = level;
    }

    _transform(logEntry, encoding, callback) {
        if (logEntry.level === this.targetLevel) {
            this.push(logEntry);
        }
        callback();
    }
}

class StatsCollector extends Transform {
    constructor(options) {
        super({...options, objectMode: true});
        this.stats = { INFO: 0, WARN: 0, ERROR: 0 };
        this.processingTime = 0;
        this.chunkCount = 0;
    }

    _transform(logEntry, encoding, callback) {
        const startTime = performance.now();
        
        this.stats[logEntry.level]++;
        this.push(logEntry);  // ← Pass through to next stream!
        
        const endTime = performance.now();
        this.processingTime += (endTime - startTime);
        this.chunkCount++;
        
        callback();
    }
}


/**
 * Generates a log file with random log entries.
 * @param {string} filename - The name of the log file to create.
 * @param {number} lines - The number of log lines to generate.
 *
 * Log entry format:
 * // [2024-01-15 10:24:11] [INFO] Server started
 * // [2024-01-15 10:24:12] [WARN] High memory usage detected
 * // [2024-01-15 10:24:12] [ERROR] Database connection failed
 */
async function generateLogs(filename, lines) {
    await pipelineAsync(
        new ReadableFromGenerator(lines),
        fs.createWriteStream(filename, { flags: 'w' })
    );
}

async function processLogs(inputFile, errorFile) {
    console.log('Processing logs...\n');
    const pipelineStartTime = performance.now();
    
    // Get file size for progress bar
    const fileStats = fs.statSync(inputFile);
    const totalBytes = fileStats.size;
    const totalMB = (totalBytes / 1024 / 1024).toFixed(2);
    console.log(`📄 File size: ${totalMB} MB\n`);
    
    // Create progress bar
    const progressBar = new ProgressBar({
        totalBytes,
        label: '📊 Processing',
        width: 40,
        updateIntervalMs: 500
    });
    
    // Start memory monitoring (samples every 1 second)
    const memMonitor = new MemoryMonitor(1000);
    memMonitor.start();
    
    // Start progress bar
    progressBar.start();

    try {
        await pipelineAsync(
            fs.createReadStream(inputFile, { highWaterMark: 1024 * 1024 }), // 1MB chunks
            new LineParser({
                progressBar,  // Pass progress bar to parser
                final(callback) {
                    progressBar.complete();  // Mark progress as complete
                    
                    const avgTime = (this.totalProcessingTime / this.chunkCount).toFixed(2);
                    console.log(`\n[LineParser] Final Stats:`);
                    console.log(`  - Processed ${numberFormatter.format(this.length)} lines`);
                    console.log(`  - Total chunks: ${numberFormatter.format(this.chunkCount)}`);
                    console.log(`  - Total time: ${this.totalProcessingTime.toFixed(2)}ms`);
                    console.log(`  - Avg per chunk: ${avgTime}ms`);
                    callback();
                }
            }),
            new StatsCollector({
                final(callback) {
                    const avgTime = (this.processingTime / this.chunkCount).toFixed(4);
                    console.log('\n[StatsCollector] Statistics:');
                    console.log(`  INFO:  ${numberFormatter.format(this.stats.INFO)}`);
                    console.log(`  WARN:  ${numberFormatter.format(this.stats.WARN)}`);
                    console.log(`  ERROR: ${numberFormatter.format(this.stats.ERROR)}`);
                    console.log(`  - Processing time: ${this.processingTime.toFixed(2)}ms`);
                    console.log(`  - Avg per entry: ${avgTime}ms\n`);
                    callback();
                }
            }),
            new LogFilter('ERROR'),
            new Transform({
                objectMode: true,
                readableObjectMode: false,
                transform(logEntry, encoding, callback) {
                    const logLine = `[${logEntry.timestamp}] [${logEntry.level}] ${logEntry.message}\n`;
                    this.push(logLine);
                    callback();
                }
            }),
            fs.createWriteStream(errorFile, { flags: 'w' })
        );

        const pipelineEndTime = performance.now();
        const totalDuration = ((pipelineEndTime - pipelineStartTime) / 1000).toFixed(2);
        
        console.log('✅ Errors written to', errorFile);
        console.log(`\n⏱️  Total Pipeline Duration: ${totalDuration}s`);
    } finally {
        // Stop memory monitoring and print summary
        memMonitor.stop();
    }
}

// await generateLogs('test-logs.log', 2_000_000); // 5.6GB
await processLogs('test-logs.log', 'errors.log');