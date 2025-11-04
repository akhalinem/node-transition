/**
 * libuv Thread Pool
 * Understanding what operations use threads vs async I/O
 */

const crypto = require('crypto');
const fs = require('fs');
const https = require('https');

console.log('=== Understanding libuv Thread Pool ===\n');

// Default thread pool size is 4
// Can be changed with: process.env.UV_THREADPOOL_SIZE = '8';

console.log(`Default UV_THREADPOOL_SIZE: ${process.env.UV_THREADPOOL_SIZE || 4}\n`);

console.log('=== Operations That Use Thread Pool ===\n');

// 1. File System operations (most of them)
console.log('1. File System operations:');
const startFS = Date.now();

fs.readFile(__filename, (err, data) => {
  console.log(`   fs.readFile completed in ${Date.now() - startFS}ms`);
});

// 2. DNS lookups (dns.lookup)
console.log('2. DNS operations:');
const dns = require('dns');
const startDNS = Date.now();

dns.lookup('google.com', (err, address) => {
  console.log(`   dns.lookup completed in ${Date.now() - startDNS}ms`);
});

// 3. Crypto operations
console.log('3. Crypto operations:');
const startCrypto1 = Date.now();

crypto.pbkdf2('password', 'salt', 100000, 64, 'sha512', (err, key) => {
  console.log(`   crypto.pbkdf2 #1 completed in ${Date.now() - startCrypto1}ms`);
});

// 4. Compression (zlib)
console.log('4. Compression operations:\n');
const zlib = require('zlib');
const startZlib = Date.now();

zlib.gzip('Some data to compress', (err, compressed) => {
  console.log(`   zlib.gzip completed in ${Date.now() - startZlib}ms`);
});

console.log('=== Operations That DON\'T Use Thread Pool ===\n');

// Network I/O uses the OS kernel's async mechanisms (epoll, kqueue, IOCP)
// NOT the thread pool!

console.log('1. Network I/O (uses OS async mechanisms):');
const startNetwork = Date.now();

https.get('https://jsonplaceholder.typicode.com/posts/1', (res) => {
  console.log(`   https.get completed in ${Date.now() - startNetwork}ms`);
  res.on('data', () => {}); // Consume data
  res.on('end', () => {
    console.log('   Network request fully consumed');
  });
});

console.log('\n=== Thread Pool Saturation Demo ===\n');

// This demonstrates what happens when thread pool is saturated
// With default size of 4, the 5th task must wait

console.log('Starting 5 crypto operations with 4 threads:');

const start = Date.now();

for (let i = 1; i <= 5; i++) {
  crypto.pbkdf2('password', 'salt', 100000, 64, 'sha512', (err, key) => {
    console.log(`Task ${i} completed in ${Date.now() - start}ms`);
  });
}

// Expected: First 4 complete around the same time
// The 5th waits for a thread to become available

console.log('\n💡 Watch the timing - first 4 tasks run in parallel, 5th waits!\n');

/**
 * INCREASING THREAD POOL SIZE
 * 
 * You can increase it before requiring modules:
 * process.env.UV_THREADPOOL_SIZE = '8';
 * 
 * Trade-offs:
 * ✅ More parallel operations
 * ⚠️  More memory usage
 * ⚠️  More CPU context switching
 * ⚠️  Diminishing returns beyond CPU core count
 */

console.log('=== Best Practices ===\n');
console.log('1. CPU-intensive work: Use Worker Threads (not thread pool)');
console.log('2. Many file operations: Consider increasing UV_THREADPOOL_SIZE');
console.log('3. Network I/O: Already async, no thread pool needed');
console.log('4. Crypto operations: Consider using async crypto or Worker Threads');
console.log('5. Monitor: Use clinic.js or 0x to identify thread pool bottlenecks');

// Prevent immediate exit
setTimeout(() => {
  console.log('\n✅ All examples completed\n');
}, 3000);
