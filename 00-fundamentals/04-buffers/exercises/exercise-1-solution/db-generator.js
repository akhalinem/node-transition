import fs from 'node:fs'
import { Buffer } from 'node:buffer'

export function generateDatabase(filename, records) {
    const outputStream = fs.createWriteStream(filename);

    // Header fields
    const magicBuffer = Buffer.from('MYDB'); // 4 bytes
    const versionBuffer = Buffer.alloc(2); // 2 bytes
    versionBuffer.writeUInt16BE(1, 0); // Version 1 in Big Endian
    const recordCountBuffer = Buffer.from(records.length.toString(16).padStart(8, '0'), 'hex'); // 4 bytes
    const reservedBuffer = Buffer.alloc(6); // 6 bytes reserved

    const headerSize = 16; // Total header size
    const headerBuffer = Buffer.concat([magicBuffer, versionBuffer, recordCountBuffer, reservedBuffer], headerSize);

    const recordSize = 64; // Each record is 64 bytes
    const recordsBuffer = Buffer.alloc(recordSize * records.length);

    records.forEach((record, index) => {
        let offset = index * recordSize;
        recordsBuffer.writeUint32BE(record.id, offset); // 4 bytes
        offset += 4;
        recordsBuffer.writeUint8(record.age, offset); // 1 byte
        offset += 1;
        recordsBuffer.write(record.name.padEnd(50, '\0'), offset, 'utf-8'); // 50 bytes
        offset += 50;
        recordsBuffer.writeUint32BE(record.salary, offset); // 4 bytes
        offset += 4;
        recordsBuffer.writeUInt8(record.active ? 1 : 0, offset); // Active flag - 1 byte
    })

    const finalBuffer = Buffer.concat([headerBuffer, recordsBuffer]);
    outputStream.write(finalBuffer);
}

