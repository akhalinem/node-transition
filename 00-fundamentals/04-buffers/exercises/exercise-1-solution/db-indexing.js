import fs from 'node:fs';
import stream from 'node:stream';
import { promisify } from 'node:util';
import { DatabaseParser } from './streamed-db-parser.js';
import { parseRecord } from './db-parser.js';

const pipelineAsync = promisify(stream.pipeline);

export async function buildIndex(dbFilename, indexFilename) {
    const dbStream = fs.createReadStream(dbFilename);
    const indexStream = fs.createWriteStream(indexFilename);
    
    const parser = new DatabaseParser();
    
    const indexTransform = new stream.Transform({
        objectMode: true,
        transform([record, offset], encoding, callback) {
            const indexEntry = Buffer.alloc(8);
            indexEntry.writeUInt32BE(record.id, 0);
            indexEntry.writeUInt32BE(offset, 4);
            callback(null, indexEntry);
        }
    });

    await pipelineAsync(
        dbStream,
        parser,
        indexTransform,
        indexStream
    );
}

function binarySearchIndex(indexBuffer, targetId) {
    let left = 0;
    let right = indexBuffer.length / 8 - 1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const midId = indexBuffer.readUInt32BE(mid * 8);
        
        if (midId === targetId) {
            return indexBuffer.readUInt32BE(mid * 8 + 4); // return offset
        } else if (midId < targetId) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return null; // Not found
}

export async function findByIdWithIndex(dbFilename, indexFilename, targetId) {
    const indexBuffer = await fs.promises.readFile(indexFilename);
    const offset = binarySearchIndex(indexBuffer, targetId);
    if (offset === null) {
        return null; // Not found
    }

    const dbFileHandle = await fs.promises.open(dbFilename, 'r');
    const recordBuffer = Buffer.alloc(64);
    await dbFileHandle.read(recordBuffer, 0, 64, offset);
    await dbFileHandle.close();

    return parseRecord(recordBuffer, 0);
}
