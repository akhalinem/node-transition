/**
 * EXERCISE 3: Ultimate Event Loop Mastery Challenge
 * 
 * This exercise includes NEW patterns you haven't seen before:
 * - Multiple async/await chains
 * - Mixed setTimeout delays
 * - Recursive scheduling patterns
 * - Complex microtask interleaving
 * 
 * DIFFICULTY: ⭐⭐⭐⭐⭐ (Expert Level)
 * 
 * 🎯 GOAL: Get 100% correct on first try!
 */

const fs = require('fs');

console.log('=== EXERCISE 3: Ultimate Event Loop Challenge ===\n');
console.log('🎯 Predict the EXACT output order (letters A-Z + numbers)');
console.log('⏱️  Take your time - accuracy over speed!\n');

console.log('--- BEGIN ---');

// === SECTION 1: Async/Await with Microtasks ===
async function asyncTask1() {
  console.log('A');
  
  await Promise.resolve();
  
  console.log('B');
  process.nextTick(() => console.log('C'));
  
  await Promise.resolve();
  
  console.log('D');
}

async function asyncTask2() {
  console.log('E');
  process.nextTick(() => console.log('F'));
  
  await Promise.resolve();
  
  console.log('G');
  Promise.resolve().then(() => console.log('H'));
}

// === SECTION 2: Timers with Different Delays ===
setTimeout(() => {
  console.log('I');
  Promise.resolve()
    .then(() => console.log('J'))
    .then(() => console.log('K'));
}, 10);

setTimeout(() => {
  console.log('L');
  process.nextTick(() => console.log('M'));
  setImmediate(() => console.log('N'));
}, 0);

// === SECTION 3: I/O with Nested Callbacks ===
fs.readFile(__filename, () => {
  console.log('O');
  
  Promise.resolve().then(() => {
    console.log('P');
    process.nextTick(() => console.log('Q'));
  });
  
  process.nextTick(() => {
    console.log('R');
    Promise.resolve().then(() => console.log('S'));
  });
  
  setImmediate(() => {
    console.log('T');
    process.nextTick(() => console.log('U'));
  });
  
  setTimeout(() => console.log('V'), 0);
});

// === SECTION 4: setImmediate Chains ===
setImmediate(() => {
  console.log('W');
  Promise.resolve().then(() => console.log('X'));
  setImmediate(() => console.log('Y'));
});

setImmediate(() => {
  console.log('Z');
  process.nextTick(() => console.log('1'));
});

// === SECTION 5: Mixed Microtasks ===
Promise.resolve().then(() => {
  console.log('2');
  process.nextTick(() => console.log('3'));
  return Promise.resolve();
}).then(() => {
  console.log('4');
  queueMicrotask(() => console.log('5'));
});

process.nextTick(() => {
  console.log('6');
  Promise.resolve().then(() => {
    console.log('7');
    process.nextTick(() => console.log('8'));
  });
});

// === SECTION 6: Immediate Execution ===
queueMicrotask(() => {
  console.log('9');
  process.nextTick(() => console.log('10'));
});

// === SECTION 7: Call Both Async Functions ===
asyncTask1();
asyncTask2();

console.log('--- END ---');

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📝 PREDICTION WORKSHEET
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Write your prediction below (copy/paste and fill in):
 * 
 * SYNCHRONOUS PHASE:
 *   Output: _________________
 * 
 * INITIAL MICROTASKS (before any event loop phase):
 *   Output: _________________
 * 
 * TIMERS PHASE (setTimeout 0ms, then 10ms):
 *   Output: _________________
 *   Microtasks after each: _________________
 * 
 * CHECK PHASE (setImmediate):
 *   Output: _________________
 *   Microtasks after each: _________________
 * 
 * POLL PHASE (fs.readFile):
 *   Output: _________________
 *   Microtasks: _________________
 *   Subsequent phases: _________________
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 🤔 ANALYSIS QUESTIONS
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Before running, answer these:
 * 
 * Q1: When does "B" print relative to "E"?
 *     Hint: Both from async functions, both after await
 *     Answer: _________________
 * 
 * Q2: What's the order of L, M, N?
 *     Hint: setTimeout 0ms with nextTick and setImmediate
 *     Answer: _________________
 * 
 * Q3: Inside fs.readFile, what runs first: setTimeout or setImmediate?
 *     Hint: I/O context matters!
 *     Answer: _________________
 * 
 * Q4: Where does "C" appear relative to "G"?
 *     Hint: nextTick scheduled after await vs Promise before await
 *     Answer: _________________
 * 
 * Q5: Does "3" print before or after "4"?
 *     Hint: nextTick from Promise vs chained Promise
 *     Answer: _________________
 * 
 * Q6: What's the last letter/number printed?
 *     Hint: Track the setTimeout with 10ms delay
 *     Answer: _________________
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 💡 STRATEGY TIPS
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * 1. Start with synchronous code (console.logs, function calls)
 * 2. Track what gets scheduled in each queue:
 *    - nextTick queue
 *    - Promise queue
 *    - Timer queue (note delays!)
 *    - setImmediate queue
 *    - I/O queue
 * 3. Process initial microtasks completely
 * 4. Remember: await = Promise microtask
 * 5. Track async function execution carefully
 * 6. Note setTimeout delays (0ms vs 10ms)
 * 7. Remember I/O context: setImmediate before setTimeout
 * 8. Microtasks run after EACH callback
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 🎯 DIFFICULTY FACTORS
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * This exercise is harder because:
 * 
 * ⭐ Multiple async functions called together
 * ⭐ Different setTimeout delays (0ms vs 10ms)
 * ⭐ Nested async/await with microtasks
 * ⭐ queueMicrotask mixed with Promises
 * ⭐ I/O callbacks with complex nesting
 * ⭐ setImmediate chains
 * ⭐ Microtasks scheduling microtasks across queues
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📋 TRACKING TABLE (Use this!)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Phase          | Callback       | Output | NextTick | Promise
 * ---------------+----------------+--------+----------+--------
 * Sync           | main           | A,E... |          |
 * Microtasks     | -              | 6...   | 6,F      | 2,9...
 * Timers         | setTimeout(0)  | L      | M        |
 * Microtasks     | -              | M      |          |
 * ...            | ...            | ...    | ...      | ...
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

console.log('\n📝 Write your complete prediction in the worksheet above!');
console.log('🎯 Then run this file and compare!');
console.log('💯 Can you get 100% correct? Let\'s find out!\n');

// Note: This code will take ~20ms to complete due to setTimeout delays
// The fs.readFile might complete at different times, but the logic remains the same
