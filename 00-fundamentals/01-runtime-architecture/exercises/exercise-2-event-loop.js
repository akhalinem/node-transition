/**
 * EXERCISE 2: Advanced Event Loop Challenge
 * 
 * This exercise tests your deep understanding of:
 * - Event loop phases and their order
 * - Microtask queue timing (after EACH callback)
 * - I/O callbacks and their interaction with timers/setImmediate
 * - Nested async operations
 * 
 * DIFFICULTY: ⭐⭐⭐⭐ (Advanced)
 */

const fs = require('fs');

console.log('=== EXERCISE 2: Event Loop Challenge ===\n');
console.log('📝 TASK: Predict the EXACT output order (1-25)');
console.log('⏱️  Time yourself: Can you solve it in under 5 minutes?\n');

console.log('--- START ---');

// Section 1: Initial synchronous code
console.log('1');

// Section 2: Microtasks scheduled immediately
process.nextTick(() => {
  console.log('2');
  Promise.resolve().then(() => console.log('3'));
});

Promise.resolve().then(() => {
  console.log('4');
  process.nextTick(() => console.log('5'));
});

// Section 3: Timer scheduled
setTimeout(() => {
  console.log('6');
  process.nextTick(() => console.log('7'));
  setImmediate(() => {
    console.log('8');
    Promise.resolve().then(() => console.log('9'));
  });
}, 0);

// Section 4: Another timer
setTimeout(() => {
  console.log('10');
  Promise.resolve()
    .then(() => {
      console.log('11');
      process.nextTick(() => console.log('12'));
    })
    .then(() => console.log('13'));
}, 0);

// Section 5: setImmediate
setImmediate(() => {
  console.log('14');
  setTimeout(() => console.log('15'), 0);
  process.nextTick(() => console.log('16'));
});

// Section 6: I/O operation
fs.readFile(__filename, () => {
  console.log('17');
  
  setTimeout(() => {
    console.log('18');
  }, 0);
  
  setImmediate(() => {
    console.log('19');
    Promise.resolve().then(() => console.log('20'));
  });
  
  process.nextTick(() => console.log('21'));
  
  Promise.resolve().then(() => {
    console.log('22');
    setImmediate(() => console.log('23'));
  });
});

// Section 7: More microtasks
Promise.resolve()
  .then(() => {
    console.log('24');
    return Promise.resolve();
  })
  .then(() => console.log('25'));

console.log('--- END ---');

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * PREDICTION GUIDE
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Before running, answer these questions:
 * 
 * 1. What gets printed FIRST and LAST synchronously?
 *    Answer: _______________________
 * 
 * 2. After synchronous code, which microtasks run?
 *    Order: _______________________
 * 
 * 3. In what order do the two setTimeout callbacks run?
 *    Why might they interleave with microtasks?
 *    Answer: _______________________
 * 
 * 4. When does the fs.readFile callback execute?
 *    What phase is it in?
 *    Answer: _______________________
 * 
 * 5. Inside the I/O callback, what's the order:
 *    setTimeout vs setImmediate?
 *    Answer: _______________________
 * 
 * 6. How many times do microtasks "interrupt" the event loop?
 *    Answer: _______________________
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * CHALLENGE QUESTIONS
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * 1. VISUALIZATION CHALLENGE:
 *    Draw the event loop phases and mark where each
 *    callback executes. Include microtask checkpoints.
 * 
 * 2. MODIFICATION CHALLENGE:
 *    Change ONE line to make output "8" appear before "14".
 *    Which line and why?
 * 
 * 3. RACE CONDITION:
 *    Why might the order of "6" and "10" vary on different runs?
 *    (Hint: They shouldn't, but do you know why?)
 * 
 * 4. MICROTASK DEPTH:
 *    What if we added this inside the first process.nextTick:
 *    ```
 *    process.nextTick(() => {
 *      process.nextTick(() => {
 *        console.log('NESTED');
 *      });
 *    });
 *    ```
 *    Where would 'NESTED' appear?
 * 
 * 5. I/O vs TIMER:
 *    Inside the fs.readFile callback, setTimeout and setImmediate
 *    are scheduled. Which runs first and why is it deterministic?
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * BONUS EXERCISES
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * After solving, try these modifications:
 * 
 * A) Add recursive setImmediate in the first timer:
 *    How many times can it iterate before other callbacks run?
 * 
 * B) Create a microtask that adds more microtasks:
 *    Can you create infinite microtask loop? What happens?
 * 
 * C) Use setTimeout with different delays (10ms, 50ms):
 *    How does this change the interleaving with I/O callbacks?
 * 
 * D) Add setInterval:
 *    Where do repeated interval callbacks fit in?
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * HINTS (Reveal only if stuck!)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Hint 1: Synchronous code always runs first
 * Hint 2: process.nextTick has priority over Promises
 * Hint 3: Microtasks run after EACH callback, not each phase
 * Hint 4: In I/O callbacks, setImmediate runs before setTimeout
 * Hint 5: The file read completes after the first event loop tick
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SOLUTION GUIDE (Don't peek!)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Run the code and compare with your prediction.
 * Then check the detailed explanation in the solution file.
 * 
 * To see the solution with explanation:
 * node exercise-2-event-loop-solution.js
 */

console.log('\n💡 TIP: Write your complete prediction before running!');
console.log('📊 Use a table to track: Phase | Callback | Microtasks\n');

// Uncomment to see execution in slow motion
// const originalLog = console.log;
// let counter = 0;
// console.log = (...args) => {
//   setTimeout(() => originalLog(`[${++counter}]`, ...args), counter * 100);
// };
