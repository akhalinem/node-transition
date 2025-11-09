/**
 * Microtasks vs Macrotasks
 * 
 * MICROTASKS (higher priority, run after current operation completes):
 * - process.nextTick()
 * - Promise callbacks (.then, .catch, .finally)
 * - queueMicrotask()
 * 
 * MACROTASKS (lower priority, run in event loop phases):
 * - setTimeout, setInterval
 * - setImmediate
 * - I/O operations
 */

console.log('1. Start');

// Macrotask
setTimeout(() => {
  console.log('5. setTimeout (Macrotask - Timers phase)');
  
  // Microtask inside macrotask
  Promise.resolve().then(() => {
    console.log('6. Promise inside setTimeout (runs immediately after setTimeout)');
  });
}, 0);

// Microtasks
Promise.resolve().then(() => {
  console.log('3. Promise 1 (Microtask)');
}).then(() => {
  console.log('4. Promise 2 (Microtask chain)');
});

process.nextTick(() => {
  console.log('2. process.nextTick (Microtask - runs FIRST)');
});

console.log('1. End');

/**
 * KEY CONCEPT:
 * After each phase of the event loop and after each callback execution,
 * Node.js checks and executes ALL microtasks before moving to the next phase.
 * 
 * This means:
 * 1. Synchronous code runs first
 * 2. All process.nextTick callbacks run
 * 3. All Promise callbacks run
 * 4. Then the event loop moves to the next phase (Timers, Check, etc.)
 */

// DANGEROUS PATTERN - This will block the event loop!
function blockEventLoop() {
  // Don't do this in production!
  console.log('\n⚠️  WARNING: Demonstrating event loop blocking...');
  
  const start = Date.now();
  while (Date.now() - start < 3000) {
    // Blocks for 3 seconds
  }
  
  console.log('💥 Event loop was blocked for 3 seconds!');
}

// Uncomment to see blocking behavior:
blockEventLoop();
