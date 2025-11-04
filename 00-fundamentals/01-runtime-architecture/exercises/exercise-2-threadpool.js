/**
 * EXERCISE 2: Thread Pool Investigation
 * 
 * Your task: Understand thread pool behavior through experimentation
 */

const crypto = require('crypto');

/**
 * PART 1: Baseline measurement
 * Run 4 crypto operations (matches default thread pool size)
 */
console.log('=== PART 1: 4 operations (thread pool size = 4) ===\n');

const start1 = Date.now();
let completed1 = 0;

for (let i = 1; i <= 4; i++) {
  crypto.pbkdf2('password', 'salt', 100000, 64, 'sha512', () => {
    completed1++;
    console.log(`Task ${i} completed at ${Date.now() - start1}ms`);
    
    if (completed1 === 4) {
      console.log(`\nAll 4 tasks completed in ${Date.now() - start1}ms\n`);
    }
  });
}

/**
 * PART 2: Saturation
 * Run 8 operations (double the thread pool size)
 * 
 * PREDICTION QUESTIONS:
 * 1. How long will the first 4 tasks take?
 * 2. How long will the next 4 tasks take?
 * 3. Will they complete in waves?
 */
setTimeout(() => {
  console.log('=== PART 2: 8 operations (thread pool size = 4) ===\n');
  
  const start2 = Date.now();
  let completed2 = 0;
  
  for (let i = 1; i <= 8; i++) {
    crypto.pbkdf2('password', 'salt', 100000, 64, 'sha512', () => {
      completed2++;
      console.log(`Task ${i} completed at ${Date.now() - start2}ms`);
      
      if (completed2 === 8) {
        console.log(`\nAll 8 tasks completed in ${Date.now() - start2}ms`);
        console.log('\n💡 Notice the pattern? First 4 complete together, then next 4\n');
      }
    });
  }
}, 3000);

/**
 * YOUR EXPERIMENTS:
 * 
 * 1. Increase thread pool size and rerun:
 *    Add this at the top: process.env.UV_THREADPOOL_SIZE = '8';
 *    How does this change the timings?
 * 
 * 2. Mix operations:
 *    Add fs.readFile calls along with crypto operations.
 *    Do they affect each other's timing?
 * 
 * 3. Network I/O:
 *    Add https.get() calls. Do they affect crypto timings?
 *    Why or why not?
 * 
 * 4. Calculate:
 *    If each crypto operation takes ~100ms and you have 4 threads,
 *    how long will 12 operations take? Test your calculation!
 * 
 * BONUS CHALLENGE:
 * Write a function that dynamically determines the optimal
 * UV_THREADPOOL_SIZE for your system based on CPU cores.
 */

console.log('\n📊 Document your findings:');
console.log('- Baseline time for 4 operations: ___ms');
console.log('- Time for first 4 of 8 operations: ___ms');
console.log('- Time for last 4 of 8 operations: ___ms');
console.log('- Pattern observed: ________________\n');
