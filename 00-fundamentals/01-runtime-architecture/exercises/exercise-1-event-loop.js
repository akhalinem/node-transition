/**
 * EXERCISE 1: Event Loop Phase Explorer
 * 
 * Your task: Predict the output order and explain why
 * Then run the code to verify your understanding
 */

console.log('START');

setTimeout(() => {
  console.log('setTimeout 1');
  Promise.resolve().then(() => console.log('Promise in setTimeout 1'));
}, 0);

setTimeout(() => {
  console.log('setTimeout 2');
}, 0);

Promise.resolve()
  .then(() => {
    console.log('Promise 1');
    process.nextTick(() => console.log('nextTick in Promise 1'));
  })
  .then(() => console.log('Promise 2'));

process.nextTick(() => {
  console.log('nextTick 1');
  process.nextTick(() => console.log('nextTick 2'));
});

setImmediate(() => {
  console.log('setImmediate 1');
});

console.log('END');

/**
 * CHALLENGE QUESTIONS:
 * 
 * 1. Write down your predicted output order (1-12)
 * 2. Explain why process.nextTick runs before Promise callbacks
 * 3. What would happen if you added this inside the first setTimeout?
 *    setImmediate(() => console.log('setImmediate in setTimeout'));
 * 4. How would the output change if this was in an I/O callback?
 * 
 * Run the code and compare your prediction!
 * 
 * BONUS: Modify the code to demonstrate:
 * - Event loop starvation with recursive nextTick
 * - Safe recursion with setImmediate
 * - Interleaving of setTimeout and setImmediate in I/O context
 */

console.log('\n📝 Write your predictions before running!');
console.log('💡 Hint: Remember the microtask queue empties completely between phases\n');
