/**
 * V8 Engine Fundamentals
 * Understanding memory, compilation, and garbage collection
 */

console.log('=== V8 Memory Management ===\n');

// V8 has two main memory spaces:
// 1. STACK - stores primitive values and references (fast, limited size ~1MB)
// 2. HEAP - stores objects and functions (larger, garbage collected)

// STACK: Simple values
let num = 42;           // Stored on stack
let str = 'hello';      // Reference on stack, data on heap (strings are special)
let bool = true;        // Stored on stack

// HEAP: Objects and arrays
let obj = { name: 'John' };  // Reference on stack, object on heap
let arr = [1, 2, 3];         // Reference on stack, array on heap

console.log('=== Hidden Classes & Inline Caching ===\n');

// V8 uses "hidden classes" to optimize object property access
// Objects with the same structure share the same hidden class

// GOOD: Consistent object structure
function Point(x, y) {
  this.x = x;  // Property added in same order
  this.y = y;  // V8 creates one hidden class for all Points
}

const p1 = new Point(1, 2);
const p2 = new Point(3, 4);
// p1 and p2 share the same hidden class - FAST!

// BAD: Inconsistent structure
const p3 = { x: 1, y: 2 };
const p4 = { y: 2, x: 1 };  // Different order = different hidden class
// p3 and p4 have different hidden classes - SLOWER!

console.log('Point objects created with consistent structure');

// Even worse: Adding properties dynamically
const p5 = { x: 1 };
p5.y = 2;  // Changes hidden class mid-execution
// p5 now has a different hidden class than p3

console.log('\n=== Garbage Collection ===\n');

// V8 uses two garbage collectors:
// 1. Scavenger (Minor GC) - for "young generation" (new objects)
// 2. Mark-Sweep/Mark-Compact (Major GC) - for "old generation" (survived objects)

function demonstrateGC() {
  // These objects will be garbage collected when function returns
  const tempArray = new Array(1000000).fill('temporary data');
  const tempObject = { data: tempArray };
  
  // Objects are initially allocated in "new space" (young generation)
  // If they survive a few garbage collection cycles, they're promoted to "old space"
  
  return 'Function completed';
}

demonstrateGC();
// tempArray and tempObject are now eligible for garbage collection

console.log('Temporary objects created and will be garbage collected');

// Force garbage collection (only works with --expose-gc flag)
if (global.gc) {
  console.log('Running garbage collection...');
  global.gc();
  console.log('Garbage collection completed');
} else {
  console.log('Run with --expose-gc to manually trigger GC');
}

console.log('\n=== Memory Leaks - Common Patterns ===\n');

// LEAK 1: Global variables (never garbage collected)
// global.leakyData = new Array(1000000); // DON'T DO THIS

// LEAK 2: Forgotten timers
const leakyTimer = setInterval(() => {
  // This keeps running forever, preventing GC
  console.log('Leaky timer running...');
}, 1000);

// ALWAYS clear timers when done
setTimeout(() => {
  clearInterval(leakyTimer);
  console.log('Timer cleaned up');
}, 5000);

// LEAK 3: Closures holding references
function createLeak() {
  const bigData = new Array(1000000);
  
  return function() {
    // This closure holds reference to bigData forever
    console.log(bigData.length);
  };
}

// const leakyFunction = createLeak(); // bigData never gets GC'd

console.log('\n=== Monitoring Memory Usage ===\n');

const memUsage = process.memoryUsage();
console.log('Memory Usage:');
console.log(`- RSS (Resident Set Size): ${Math.round(memUsage.rss / 1024 / 1024)} MB`);
console.log(`- Heap Total: ${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`);
console.log(`- Heap Used: ${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`);
console.log(`- External: ${Math.round(memUsage.external / 1024 / 1024)} MB`);

console.log('\n=== V8 Flags for Optimization ===\n');

console.log('Useful V8 flags:');
console.log('- node --expose-gc script.js          (manual GC control)');
console.log('- node --max-old-space-size=4096      (increase heap size to 4GB)');
console.log('- node --trace-gc script.js           (trace GC activity)');
console.log('- node --prof script.js               (CPU profiling)');
console.log('- node --inspect script.js            (debug with Chrome DevTools)');

/**
 * BEST PRACTICES:
 * 
 * 1. Keep object shapes consistent (same properties in same order)
 * 2. Avoid dynamically adding properties to objects
 * 3. Use object pooling for frequently created/destroyed objects
 * 4. Clear timers and event listeners when done
 * 5. Be careful with closures holding large data
 * 6. Monitor memory usage in production
 * 7. Use --inspect to profile and find memory leaks
 */
