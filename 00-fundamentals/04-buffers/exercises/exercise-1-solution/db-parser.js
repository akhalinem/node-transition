import fs from 'node:fs'

export function parseHeader(buffer) {
    const magic = buffer.slice(0, 4).toString('utf-8');
    if(magic !== 'MYDB') {
        throw new Error("Invalid magic number");
    }
    const version = buffer.readUInt16BE(4);
    const recordCount = buffer.readUInt32BE(6);
    return { magic, version, recordCount };
}

export function parseRecord(buffer, offset) {
    const id = buffer.readUInt32BE(offset);
    offset += 4;
    const age = buffer.readUInt8(offset);
    offset += 1;
    const name = buffer.slice(offset, offset + 50).toString('utf-8').replace(/\0/g, '');
    offset += 50;
    const salary = buffer.readUInt32BE(offset);
    offset += 4;
    const active = buffer.readUInt8(offset) === 1;
    return { id, age, name, salary, active };
}

export function parseDatabase(filename) {
    const file = fs.readFileSync(filename);
    const header = parseHeader(file.subarray(0, 16));
    const records = [];
    let offset = 16;
    for(let i = 0; i < header.recordCount; i++) {
        const record = parseRecord(file, offset);
        records.push(record);
        offset += 64;
    }
    return { header, records };
}

export function findById(filename, id) {
    const db = parseDatabase(filename);
    return db.records.find(record => record.id === id);
}

export function findByAge(filename, minAge, maxAge) {
    const db = parseDatabase(filename);
    return db.records.filter(record => record.age >= minAge && record.age <= maxAge);
}

export function getActiveUsers(filename) {
    const db = parseDatabase(filename);
    return db.records.filter(record => record.active);
}

export function updateSalary(filename, id, newSalary) {
    const db = parseDatabase(filename);
    const record = db.records.find(record => record.id === id);
    if(record) {
        record.salary = newSalary;
        generateDatabase(filename, db.records);
    } else {
        throw new Error("Record not found");
    }
}
