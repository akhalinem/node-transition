import fs from 'node:fs'
import stream from 'node:stream'
import { Buffer } from 'node:buffer'
import { promisify } from 'node:util';
import { parseHeader, parseRecord } from './db-parser.js';

const pipelineAsync = promisify(stream.pipeline);

export class DatabaseParser extends stream.Transform {
    constructor(options) {
        super({ ...options, readableObjectMode: true });
        this.header = null;
        this.recordBuffer = Buffer.alloc(0);
        this.offset = 0;
    }

    _transform(chunk, encoding, callback) {
        if (!this.header) {
            this.recordBuffer = Buffer.concat([this.recordBuffer, chunk]);
            if (this.recordBuffer.length >= 16) {
                this.header = parseHeader(this.recordBuffer.subarray(0, 16));
                this.recordBuffer = this.recordBuffer.subarray(16);
                this.offset += 16;
            } else {
                callback(new Error("Incomplete header"));
            }
        } else {
            this.recordBuffer = Buffer.concat([this.recordBuffer, chunk]);
        }

        while (this.recordBuffer.length >= 64) {
            const record = this.recordBuffer.subarray(0, 64);
            this.recordBuffer = this.recordBuffer.subarray(64);
            this.push([parseRecord(record, 0), this.offset]);
            this.offset += 64;
        }
        callback();
    }

    _flush(callback) {
        if (this.recordBuffer.length > 0) {
            callback(new Error("Incomplete record at end of stream"));
        } else {
            callback();
        }
    }
}

export async function streamParseDatabase(filename) {
    const readStream = fs.createReadStream(filename);
    const parser = new DatabaseParser();
    
    await pipelineAsync(
        readStream,
        parser,
        new stream.Writable({
            objectMode: true,
            write([record, offset], encoding, callback) {
                console.log('Parsed Record: ', record);
                console.log('Record Offset: ', offset);
                callback();
            }
        })
    );
}

export async function streamFindById(filename, id) {
    const readStream = fs.createReadStream(filename);
    const parser = new DatabaseParser();
    let result = null;
    
    await pipelineAsync(
        readStream,
        parser,
        new stream.Writable({
            objectMode: true,
            write([record, offset], encoding, callback) {
                if (record.id === id) {
                    result = [record, offset];
                }
                callback();
            }
        })
    );

    return result;
}

export async function streamFindByAge(filename, minAge, maxAge) {
    const readStream = fs.createReadStream(filename);
    const parser = new DatabaseParser();
    
    await pipelineAsync(
        readStream,
        parser,
        new stream.Writable({
            objectMode: true,
            write([record, offset], encoding, callback) {
                if (record.age >= minAge && record.age <= maxAge) {
                    console.log('Found Record: ', record);
                    console.log('Record Offset: ', offset);
                }
                callback();
            }
        })
    );
}

export async function streamGetActiveUsers(filename) {
    const readStream = fs.createReadStream(filename);
    const parser = new DatabaseParser();
    
    await pipelineAsync(
        readStream,
        parser,
        new stream.Writable({
            objectMode: true,
            write([record, offset], encoding, callback) {
                if (record.active) {
                    console.log('Active User: ', record);
                    console.log('Record Offset: ', offset);
                }
                callback();
            }
        })
    );
}
