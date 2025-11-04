/**
 * setImmediate vs setTimeout vs process.nextTick
 * Understanding the differences and when to use each
 */

console.log('=== SCENARIO 1: Main module (non-I/O context) ===\n');

setTimeout(() => {
  console.log('setTimeout');
}, 0);

setImmediate(() => {
  console.log('setImmediate');
});

// Order is not guaranteed in main module!
// Can be setTimeout -> setImmediate OR setImmediate -> setTimeout

console.log('\n=== SCENARIO 2: Inside I/O cycle ===\n');

const fs = require('fs');

fs.readFile(__filename, () => {
  console.log('fs.readFile callback');
  
  setTimeout(() => {
    console.log('  └─ setTimeout (inside I/O)');
  }, 0);
  
  setImmediate(() => {
    console.log('  └─ setImmediate (inside I/O)');
  });
  
  // Inside I/O cycle, setImmediate ALWAYS runs before setTimeout
});

console.log('\n=== SCENARIO 3: Understanding process.nextTick ===\n');

setImmediate(() => {
  console.log('setImmediate 1');
  
  process.nextTick(() => {
    console.log('  └─ nextTick inside setImmediate');
  });
});

process.nextTick(() => {
  console.log('nextTick 1');
  
  process.nextTick(() => {
    console.log('  └─ nextTick inside nextTick');
  });
});

/**
 * WHEN TO USE EACH:
 * 
 * process.nextTick():
 * ✅ When you need to execute something BEFORE any I/O operations
 * ✅ For error handling that must happen immediately
 * ✅ Allow users to register event handlers after construction but before I/O
 * ⚠️  USE SPARINGLY - can starve the event loop if used recursively
 * 
 * setImmediate():
 * ✅ Recommended for deferring work
 * ✅ When you want to execute after I/O events
 * ✅ Breaking up long-running operations
 * ✅ Better for recursive operations (won't starve I/O)
 * 
 * setTimeout(fn, 0):
 * ⚠️  Least precise timing
 * ⚠️  Use setImmediate instead in most cases
 * ✅ Only when you specifically need timer behavior
 */

console.log('\n=== SCENARIO 4: DANGEROUS - Recursive nextTick (DON\'T DO THIS) ===\n');

let count = 0;

function recursiveNextTick() {
  if (count < 5) {
    count++;
    console.log(`nextTick recursion: ${count}`);
    process.nextTick(recursiveNextTick);
  }
}

// This blocks I/O, but we'll limit it to 5 iterations
recursiveNextTick();

// This will execute AFTER all nextTick callbacks
setTimeout(() => {
  console.log('setTimeout - finally executed after all nextTicks');
}, 0);

console.log('\n=== SCENARIO 5: SAFE - Recursive setImmediate ===\n');

let count2 = 0;

function recursiveSetImmediate() {
  if (count2 < 5) {
    count2++;
    console.log(`setImmediate recursion: ${count2}`);
    setImmediate(recursiveSetImmediate);
  }
}

// This allows I/O to happen between iterations
recursiveSetImmediate();

// This can interleave with setImmediate
setTimeout(() => {
  console.log('setTimeout - can run between setImmediate calls');
}, 0);
