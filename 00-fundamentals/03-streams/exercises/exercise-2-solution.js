import fs from 'fs'
import { Transform, pipeline, Readable, Writable } from 'stream';
import { promisify } from 'util';
import { Worker } from 'worker_threads';
import { cpus } from 'os';

const pipelineAsync = promisify(pipeline);
const numberFormatter = new Intl.NumberFormat();

class CsvParser extends Transform {
  constructor(options) {
    super({ ...options, objectMode: true });
    this.headers = null;
    this.rowNumber = 0;
    this.buffer = '';
  }

  _transform(chunk, encoding, callback) {
    this.buffer += chunk.toString();
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop();
    for (const line of lines) {
      if (!line.trim()) continue;

      if (!this.headers) {
        this.headers = line.split(',');
      } else {
        this.rowNumber++;
        const values = line.split(',');
        const record = {};
        this.headers.forEach((header, index) => {
          record[header] = values[index];
        });
        this.push({ ...record, rowNumber: this.rowNumber });
      }
    }
    callback();
  }

  _flush(callback) {
    if (this.buffer) {
      const line = this.buffer;
      if (this.headers) {
        this.rowNumber++;
        const values = line.split(',');
        const record = {};
        this.headers.forEach((header, index) => {
          record[header] = values[index];
        });
        this.push({ ...record, rowNumber: this.rowNumber });
      }
    }
    callback();
  }
}

class DataValidator extends Transform {
  constructor(errorFile, options) {
    super({ ...options, objectMode: true });
    this.errors = [];
    this.errorFile = errorFile;
    this.errorStream = fs.createWriteStream(this.errorFile, { flags: 'w' });
  }

  _transform(record, encoding, callback) {
    const { rowNumber, name, email, age, country } = record;
    const rowErrors = [];

    if (!name || name.length < 2) {
      rowErrors.push('Name is too short');
    }
    if (!email || !email.includes('@')) {
      rowErrors.push('Invalid email');
    }
    const ageNum = Number(age);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
      rowErrors.push('Invalid age');
    }
    if (!country || country.length < 2) {
      rowErrors.push('Country is too short');
    }

    if (rowErrors.length > 0) {
      this.errorStream.write(`Row ${rowNumber}: ${rowErrors.join(', ')}\n`);
    } else {
      this.push(record);
    }

    callback();
  }

  _flush(callback) {
    this.errorStream.end();
    callback();
  }
}

class DataTransformer extends Transform { 
  constructor(transformFn, options) {
    super({ ...options, objectMode: true });
    this.transformFn = transformFn;
  }

  _transform(record, encoding, callback) {
    const transformed = this.transformFn(record);
    this.push(transformed);
    callback();
  }
}

class JsonArrayWriter extends Writable {
  constructor(outputFile, options) {
    super({ ...options, objectMode: true });
    this.outputFile = outputFile;
    this.records = [];
  }

  _write(record, encoding, callback) {
    this.records.push(record);
    callback();
  }

  _final(callback) {
    fs.writeFileSync(this.outputFile, JSON.stringify(this.records, null, 2));
    callback();
  }
}

class JsonLinesWriter extends Writable {
  constructor(outputFile, options) {
    super({ ...options, objectMode: true });
    this.outputFile = outputFile;
    this.writeStream = fs.createWriteStream(this.outputFile);
  }

  _write(record, encoding, callback) {
    if(this.writeStream.write(`${JSON.stringify(record)}\n`, encoding, callback)) {
      callback();
    } else {
      this.writeStream.once('drain', callback);
    }
  }

  _final(callback) {
    this.writeStream.close(callback);
  }
}

function generateTestCsv(filename,rows) {
  const names = ['Alice', 'Bob', 'Charlie', 'David', 'Eva', 'Frank', 'Grace', 'Hannah', 'Ian', 'Jane'];
  const countries = ['USA', 'Canada', 'UK', 'Germany', 'France', 'Australia', 'Japan', 'China', 'India', 'Brazil'];

  // Generate CSV with:
  // - 90% valid data
  // - 10% invalid data (bad emails, age, etc.)

  const writeStream = fs.createWriteStream(filename);
  writeStream.write('name,email,age,country\n');

  for (let i = 0; i < rows; i++) {
    const name = names[Math.floor(Math.random() * names.length)];
    const country = countries[Math.floor(Math.random() * countries.length)];
    let email;
    let age;

    // Introduce some invalid data
    if (Math.random() < 0.1) {
      email = 'invalid-email'; // Invalid email
    } else {
      email = `${name.toLowerCase()}@${countries[Math.floor(Math.random() * countries.length)].toLowerCase()}.com`;
    }

    // Introduce some invalid age
    if (Math.random() < 0.1) {
      age = 'invalid-age'; // Invalid age
    } else {
      age = Math.floor(Math.random() * 100);
    }

    writeStream.write(`${name},${email},${age},${country}\n`);
  }

  writeStream.end();
}

// Generate a test CSV file with 1 million rows
// generateTestCsv('large_test.csv', 1_000_000);

// Build dual pipelines for JSON Array and JSON Lines outputs
async function processCsv(inputFile, jsonArrayFile, jsonLinesFile, errorsFile='errors.log') {
    const startTime = Date.now();

    const readStream1 = fs.createReadStream(inputFile, { highWaterMark: 1024 * 1024 });
    const readStream2 = fs.createReadStream(inputFile, { highWaterMark: 1024 * 1024 });

    const csvParser1 = new CsvParser();
    const csvParser2 = new CsvParser();

    const validator1 = new DataValidator(errorsFile);
    const validator2 = new DataValidator(errorsFile);

    const transformer1 = new DataTransformer(record => ({
        ...record,
        name: record.name.toUpperCase(),
        country: record.country.toUpperCase()
    }));

    const transformer2 = new DataTransformer(record => ({
        ...record,
        name: record.name.toLowerCase(),
        country: record.country.toLowerCase()
    }));
    const jsonArrayWriter = new JsonArrayWriter(jsonArrayFile);
    const jsonLinesWriter = new JsonLinesWriter(jsonLinesFile);

    await Promise.all([
        pipelineAsync(
            readStream1,
            csvParser1,
            validator1,
            transformer1,
            jsonArrayWriter
        ),
        pipelineAsync(
            readStream2,
            csvParser2,
            validator2,
            transformer2,
            jsonLinesWriter
        )
    ]);

    const endTime = Date.now();
    console.log(`Processing completed in ${(endTime - startTime) / 1000} seconds`);
}

// Run the processing
processCsv('large_test.csv', 'output_array.json', 'output_lines.json')
    .then(() => console.log('All done!'))
    .catch(err => console.error('Error processing CSV:', err));
