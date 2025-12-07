import crypto from 'node:crypto';
import { Transform } from 'node:stream';

export class ChecksumTransform extends Transform {
    constructor(algorithm = 'sha256', options) {
        super(options);
        this.hash = crypto.createHash(algorithm);
    }

    _transform(chunk, encoding, callback) {
        // Update hash
        // Pass chunk through unchanged

        this.hash.update(chunk);
        this.push(chunk);
        callback();
    }

    _flush(callback) {
        // Emit checksum
        this.emit("checksum", this.hash.digest('hex'));
        callback();
    }
}
