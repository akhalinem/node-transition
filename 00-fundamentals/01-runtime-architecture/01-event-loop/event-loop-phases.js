/**
 * Event Loop Phases Demonstration
 * 
 * The Node.js event loop has 6 phases:
 * 1. Timers - executes callbacks scheduled by setTimeout() and setInterval()
 * 2. Pending callbacks - executes I/O callbacks deferred to the next loop iteration
 * 3. Idle, prepare - only used internally
 * 4. Poll - retrieve new I/O events; execute I/O related callbacks
 * 5. Check - setImmediate() callbacks are invoked here
 * 6. Close callbacks - e.g. socket.on('close', ...)
 */

console.log('🚀 Script start');

// Timers phase
setTimeout(() => {
  console.log('⏰ setTimeout 0ms');
}, 0);

// Check phase
setImmediate(() => {
  console.log('⚡ setImmediate');
});

// Microtask queue (runs after each phase)
Promise.resolve().then(() => {
  console.log('🔄 Promise (microtask)');
});

// Microtask queue (runs BEFORE next phase)
process.nextTick(() => {
  console.log('⏭️  process.nextTick (microtask)');
});

console.log('✅ Script end');

/**
 * Expected Output Order:
 * 1. 🚀 Script start
 * 2. ✅ Script end
 * 3. ⏭️  process.nextTick (microtask) - always runs first after current operation
 * 4. 🔄 Promise (microtask) - microtasks run after nextTick
 * 5. ⏰ setTimeout 0ms - timers phase
 * 6. ⚡ setImmediate - check phase
 * 
 * Note: setTimeout vs setImmediate order can vary in the main module,
 * but inside an I/O cycle, setImmediate is always first
 */
