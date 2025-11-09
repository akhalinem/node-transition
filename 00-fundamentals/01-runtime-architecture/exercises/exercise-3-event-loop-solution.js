/**
 * EXERCISE 3: SOLUTION & EXPLANATION
 * 
 * Run exercise-3-event-loop.js first to see the actual output,
 * then come here for the detailed explanation.
 */

console.log('=== EXERCISE 3: SOLUTION ===\n');
console.log('CORRECT OUTPUT ORDER:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const solution = [
  '--- BEGIN ---',
  'A',    // asyncTask1() starts - sync
  'E',    // asyncTask2() starts - sync
  '--- END ---',
  '6',    // nextTick - highest priority
  'F',    // nextTick from asyncTask2 (scheduled in sync phase)
  '2',    // Promise
  '9',    // queueMicrotask (same as Promise queue)
  '7',    // Promise from nextTick 6
  '10',   // nextTick from queueMicrotask 9
  '3',    // nextTick from Promise 2
  '8',    // nextTick from Promise 7
  'B',    // asyncTask1 resumes after first await
  'G',    // asyncTask2 resumes after first await
  '4',    // Chained promise from 2
  'H',    // Promise scheduled in asyncTask2 G
  '5',    // queueMicrotask from promise 4
  'C',    // nextTick from asyncTask1 B
  'D',    // asyncTask1 continues after second await
  'L',    // setTimeout(0) callback
  'M',    // nextTick from L
  'W',    // setImmediate (first)
  'X',    // Promise from W
  'Z',    // setImmediate (second)
  '1',    // nextTick from Z
  'N',    // setImmediate from L
  'Y',    // setImmediate from W (scheduled in previous check phase)
  'O',    // fs.readFile callback (I/O phase)
  'R',    // nextTick from O
  'P',    // Promise from O
  'S',    // Promise from nextTick R
  'Q',    // nextTick from Promise P
  'T',    // setImmediate from O (runs before setTimeout in I/O context!)
  'U',    // nextTick from T
  'V',    // setTimeout from O (runs after setImmediate in I/O context)
  'I',    // setTimeout(10) - has 10ms delay, runs last
  'J',    // Promise from I
  'K'     // Chained promise from J
];

solution.forEach((output, index) => {
  console.log(`${String(index + 1).padStart(2, ' ')}. ${output}`);
});

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('DETAILED STEP-BY-STEP EXPLANATION:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('┌────────────────────────────────────────────────────┐');
console.log('│ PHASE 1: SYNCHRONOUS EXECUTION                     │');
console.log('├────────────────────────────────────────────────────┤');
console.log('│ Output: "--- BEGIN ---", "A", "E", "--- END ---"   │');
console.log('│                                                    │');
console.log('│ What happens:                                      │');
console.log('│  1. Print "--- BEGIN ---"                          │');
console.log('│  2. asyncTask1() called → prints "A"               │');
console.log('│     - Hits first await, pauses, schedules to      │');
console.log('│       Promise queue for continuation               │');
console.log('│  3. asyncTask2() called → prints "E"               │');
console.log('│     - schedules nextTick "F"                       │');
console.log('│     - Hits await, pauses, schedules continuation   │');
console.log('│  4. Print "--- END ---"                            │');
console.log('│                                                    │');
console.log('│ Scheduled:                                         │');
console.log('│  - setTimeout(L, 0ms)                              │');
console.log('│  - setTimeout(I, 10ms)                             │');
console.log('│  - setImmediate(W), setImmediate(Z)                │');
console.log('│  - fs.readFile(O callback)                         │');
console.log('│  - nextTick: 6, F                                  │');
console.log('│  - Promise: 2, 9, B continuation, G continuation   │');
console.log('└────────────────────────────────────────────────────┘\n');

console.log('┌────────────────────────────────────────────────────┐');
console.log('│ PHASE 2: INITIAL MICROTASKS                        │');
console.log('├────────────────────────────────────────────────────┤');
console.log('│ Output: "6", "F", "2", "9", "7", "10", "3", "8"   │');
console.log('│                                                    │');
console.log('│ nextTick Queue First:                              │');
console.log('│  1. "6" - scheduled in main body                   │');
console.log('│     → schedules Promise "7"                        │');
console.log('│  2. "F" - from asyncTask2 sync phase               │');
console.log('│                                                    │');
console.log('│ Promise Queue:                                     │');
console.log('│  3. "2" - scheduled in main body                   │');
console.log('│     → schedules nextTick "3"                       │');
console.log('│     → schedules chained promise "4"                │');
console.log('│  4. "9" - queueMicrotask in main body              │');
console.log('│     → schedules nextTick "10"                      │');
console.log('│  5. "7" - Promise from nextTick "6"                │');
console.log('│     → schedules nextTick "8"                       │');
console.log('│                                                    │');
console.log('│ Back to nextTick (newly added):                    │');
console.log('│  6. "10" - from queueMicrotask "9"                 │');
console.log('│  7. "3" - from Promise "2"                         │');
console.log('│  8. "8" - from Promise "7"                         │');
console.log('└────────────────────────────────────────────────────┘\n');

console.log('┌────────────────────────────────────────────────────┐');
console.log('│ PHASE 3: ASYNC FUNCTION CONTINUATIONS              │');
console.log('├────────────────────────────────────────────────────┤');
console.log('│ Output: "B", "G", "4", "H", "5", "C", "D"         │');
console.log('│                                                    │');
console.log('│ Promise Queue (async/await continuations):         │');
console.log('│  1. "B" - asyncTask1 resumes after first await     │');
console.log('│     → schedules nextTick "C"                       │');
console.log('│     → hits second await, schedules "D"             │');
console.log('│  2. "G" - asyncTask2 resumes after await           │');
console.log('│     → schedules Promise "H"                        │');
console.log('│  3. "4" - chained promise from "2"                 │');
console.log('│     → schedules queueMicrotask "5"                 │');
console.log('│  4. "H" - Promise from "G"                         │');
console.log('│  5. "5" - queueMicrotask from "4"                  │');
console.log('│                                                    │');
console.log('│ nextTick Queue (newly added):                      │');
console.log('│  6. "C" - from "B"                                 │');
console.log('│                                                    │');
console.log('│ Promise Queue (continuation):                      │');
console.log('│  7. "D" - asyncTask1 after second await            │');
console.log('└────────────────────────────────────────────────────┘\n');

console.log('┌────────────────────────────────────────────────────┐');
console.log('│ PHASE 4: TIMERS (setTimeout 0ms)                  │');
console.log('├────────────────────────────────────────────────────┤');
console.log('│ Output: "L", "M"                                   │');
console.log('│                                                    │');
console.log('│  1. "L" - setTimeout(0) callback                   │');
console.log('│     → schedules nextTick "M"                       │');
console.log('│     → schedules setImmediate "N"                   │');
console.log('│                                                    │');
console.log('│ Microtasks after callback:                         │');
console.log('│  2. "M" - nextTick from "L"                        │');
console.log('│                                                    │');
console.log('│ Note: setTimeout(10ms) not ready yet              │');
console.log('└────────────────────────────────────────────────────┘\n');

console.log('┌────────────────────────────────────────────────────┐');
console.log('│ PHASE 5: CHECK (setImmediate - Round 1)           │');
console.log('├────────────────────────────────────────────────────┤');
console.log('│ Output: "W", "X", "Z", "1"                         │');
console.log('│                                                    │');
console.log('│  1. "W" - first setImmediate                       │');
console.log('│     → schedules Promise "X"                        │');
console.log('│     → schedules setImmediate "Y" (next round!)     │');
console.log('│                                                    │');
console.log('│ Microtasks:                                        │');
console.log('│  2. "X" - Promise from "W"                         │');
console.log('│                                                    │');
console.log('│  3. "Z" - second setImmediate                      │');
console.log('│     → schedules nextTick "1"                       │');
console.log('│                                                    │');
console.log('│ Microtasks:                                        │');
console.log('│  4. "1" - nextTick from "Z"                        │');
console.log('└────────────────────────────────────────────────────┘\n');

console.log('┌────────────────────────────────────────────────────┐');
console.log('│ PHASE 6: CHECK (setImmediate - Round 2)           │');
console.log('├────────────────────────────────────────────────────┤');
console.log('│ Output: "N", "Y"                                   │');
console.log('│                                                    │');
console.log('│  1. "N" - setImmediate from "L"                    │');
console.log('│  2. "Y" - setImmediate from "W"                    │');
console.log('└────────────────────────────────────────────────────┘\n');

console.log('┌────────────────────────────────────────────────────┐');
console.log('│ PHASE 7: POLL (I/O - fs.readFile completes)       │');
console.log('├────────────────────────────────────────────────────┤');
console.log('│ Output: "O", "R", "P", "S", "Q"                    │');
console.log('│                                                    │');
console.log('│  1. "O" - fs.readFile callback                     │');
console.log('│     → schedules Promise "P"                        │');
console.log('│     → schedules nextTick "R"                       │');
console.log('│     → schedules setImmediate "T"                   │');
console.log('│     → schedules setTimeout "V"                     │');
console.log('│                                                    │');
console.log('│ Microtasks (after O):                              │');
console.log('│  2. "R" - nextTick from "O"                        │');
console.log('│     → schedules Promise "S"                        │');
console.log('│  3. "P" - Promise from "O"                         │');
console.log('│     → schedules nextTick "Q"                       │');
console.log('│  4. "S" - Promise from "R"                         │');
console.log('│  5. "Q" - nextTick from "P"                        │');
console.log('└────────────────────────────────────────────────────┘\n');

console.log('┌────────────────────────────────────────────────────┐');
console.log('│ PHASE 8: CHECK (setImmediate from I/O)            │');
console.log('├────────────────────────────────────────────────────┤');
console.log('│ Output: "T", "U"                                   │');
console.log('│                                                    │');
console.log('│  ⚠️  KEY: In I/O callbacks, setImmediate runs       │');
console.log('│     BEFORE setTimeout!                             │');
console.log('│                                                    │');
console.log('│  1. "T" - setImmediate from "O"                    │');
console.log('│     → schedules nextTick "U"                       │');
console.log('│                                                    │');
console.log('│ Microtasks:                                        │');
console.log('│  2. "U" - nextTick from "T"                        │');
console.log('└────────────────────────────────────────────────────┘\n');

console.log('┌────────────────────────────────────────────────────┐');
console.log('│ PHASE 9: TIMERS (setTimeout from I/O)             │');
console.log('├────────────────────────────────────────────────────┤');
console.log('│ Output: "V"                                        │');
console.log('│                                                    │');
console.log('│  1. "V" - setTimeout from "O" I/O callback         │');
console.log('│     Runs AFTER setImmediate "T" due to I/O context│');
console.log('└────────────────────────────────────────────────────┘\n');

console.log('┌────────────────────────────────────────────────────┐');
console.log('│ PHASE 10: TIMERS (setTimeout 10ms finally ready)  │');
console.log('├────────────────────────────────────────────────────┤');
console.log('│ Output: "I", "J", "K"                              │');
console.log('│                                                    │');
console.log('│  1. "I" - setTimeout(10ms) callback                │');
console.log('│     → schedules Promise "J"                        │');
console.log('│                                                    │');
console.log('│ Microtasks:                                        │');
console.log('│  2. "J" - Promise from "I"                         │');
console.log('│     → schedules chained promise "K"                │');
console.log('│  3. "K" - chained promise from "J"                 │');
console.log('└────────────────────────────────────────────────────┘\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('KEY LEARNING POINTS:');
console.log('═══════════════════════════════════════════════════════\n');

console.log('1️⃣  ASYNC/AWAIT TIMING:');
console.log('   - First line is synchronous');
console.log('   - After await = Promise microtask');
console.log('   - Multiple awaits = multiple Promise microtasks\n');

console.log('2️⃣  SETTIMEOUT DELAYS MATTER:');
console.log('   - setTimeout(0) and setTimeout(10) run at different times');
console.log('   - Even 0ms has some minimum delay');
console.log('   - Longer delays run in later event loop ticks\n');

console.log('3️⃣  I/O CONTEXT IS SPECIAL:');
console.log('   - Inside I/O callbacks: setImmediate BEFORE setTimeout');
console.log('   - Outside I/O: order can vary (non-deterministic)');
console.log('   - This is a KEY difference from main context!\n');

console.log('4️⃣  MICROTASK INTERLEAVING:');
console.log('   - Promises can schedule nextTick');
console.log('   - nextTick can schedule Promises');
console.log('   - They interleave constantly but maintain priority\n');

console.log('5️⃣  QUEUEMICROTASK === PROMISE:');
console.log('   - queueMicrotask shares Promise queue');
console.log('   - Both run after nextTick');
console.log('   - Both run before event loop phases\n');

console.log('6️⃣  SETIMMEDIATE CHAINS:');
console.log('   - setImmediate can schedule more setImmediate');
console.log('   - New setImmediate runs in next CHECK phase');
console.log('   - Allows other phases to run between\n');

console.log('7️⃣  MICROTASKS AFTER EACH CALLBACK:');
console.log('   - This is the most important rule!');
console.log('   - Every single callback triggers microtask checkpoint');
console.log('   - Explains the interleaving pattern\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('🎯 MASTERY CHECKLIST:\n');
console.log('  ✅ Understand async/await creates Promise microtasks');
console.log('  ✅ Know nextTick always runs before Promises');
console.log('  ✅ Remember I/O context changes setImmediate/setTimeout order');
console.log('  ✅ Track microtask checkpoints after EVERY callback');
console.log('  ✅ Handle different setTimeout delays');
console.log('  ✅ Understand recursive scheduling patterns');
console.log('  ✅ Know queueMicrotask = Promise queue\n');

console.log('💯 If you got this right, you truly understand the event loop!\n');
