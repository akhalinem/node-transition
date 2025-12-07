import { Transform } from 'node:stream';

export class SizeValidator extends Transform {
    constructor(maxSizeBytes, options) {
        super(options);
        this.maxSizeBytes = maxSizeBytes;
        this.bytesReceived = 0;
    }

    _transform(chunk, encoding, callback) {
        this.bytesReceived += chunk.length;
        
        if (this.bytesReceived > this.maxSizeBytes) {
            const error = new Error(
                `File size exceeds maximum allowed size of ${(this.maxSizeBytes / 1024 / 1024).toFixed(0)} MB`
            );
            error.code = 'FILE_TOO_LARGE';
            callback(error);
        } else {
            this.push(chunk);
            callback();
        }
    }
}
