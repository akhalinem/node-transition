/**
 * MICROTASK PRIORITIZATION: Complete Theory Guide
 * 
 * Understanding the hierarchy and execution order of microtasks
 * in Node.js event loop
 */

console.log('═══════════════════════════════════════════════════════════');
console.log('  MICROTASK PRIORITIZATION - Complete Theory');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('PART 1: THE TWO MICROTASK QUEUES');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('Node.js has TWO separate microtask queues:\n');

console.log('1. NEXTTICK QUEUE (process.nextTick)');
console.log('   - Highest priority');
console.log('   - Node.js specific (not in browsers)');
console.log('   - Runs before promise microtasks');
console.log('   - Can starve the event loop if overused\n');

console.log('2. PROMISE MICROTASK QUEUE');
console.log('   - Standard ECMAScript microtasks');
console.log('   - Includes: Promises, queueMicrotask()');
console.log('   - Runs after nextTick queue is empty');
console.log('   - Cross-platform (browsers + Node.js)\n');

console.log('┌─────────────────────────────────────────────────┐');
console.log('│ EXECUTION ORDER                                 │');
console.log('├─────────────────────────────────────────────────┤');
console.log('│ 1. Execute callback/synchronous code            │');
console.log('│ 2. Drain ENTIRE nextTick queue ⚡               │');
console.log('│    (even if callbacks add more nextTicks)       │');
console.log('│ 3. Drain ENTIRE Promise queue 🔄                │');
console.log('│    (even if callbacks add more promises)        │');
console.log('│ 4. Continue to next phase/callback              │');
console.log('└─────────────────────────────────────────────────┘\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('PART 2: DEMONSTRATION - Basic Priority');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('Example 1: nextTick vs Promise\n');

setTimeout(() => {
  console.log('\n--- Demo 1: Basic Priority ---');
  
  Promise.resolve().then(() => console.log('1. Promise'));
  process.nextTick(() => console.log('2. nextTick'));
  
  console.log('Expected order: nextTick, then Promise');
  
  setTimeout(() => demo2(), 100);
}, 100);

function demo2() {
  console.log('\n--- Demo 2: Multiple of Each ---');
  
  Promise.resolve().then(() => console.log('1. Promise A'));
  process.nextTick(() => console.log('2. nextTick A'));
  Promise.resolve().then(() => console.log('3. Promise B'));
  process.nextTick(() => console.log('4. nextTick B'));
  
  console.log('Expected: All nextTicks first, then all Promises');
  
  setTimeout(() => demo3(), 100);
}

function demo3() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('PART 3: RECURSIVE MICROTASKS (Queue Draining)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('--- Demo 3: nextTick adds nextTick ---\n');
  
  let nextTickCount = 0;
  
  process.nextTick(() => {
    console.log(`1. nextTick ${++nextTickCount}`);
    if (nextTickCount < 3) {
      process.nextTick(() => {
        console.log(`2. nextTick ${++nextTickCount}`);
        if (nextTickCount < 3) {
          process.nextTick(() => {
            console.log(`3. nextTick ${++nextTickCount}`);
          });
        }
      });
    }
  });
  
  Promise.resolve().then(() => console.log('4. Promise (runs AFTER all nextTicks)'));
  
  setTimeout(() => demo4(), 100);
}

function demo4() {
  console.log('\n--- Demo 4: Promise adds Promise ---\n');
  
  let promiseCount = 0;
  
  Promise.resolve()
    .then(() => {
      console.log(`1. Promise ${++promiseCount}`);
      return Promise.resolve();
    })
    .then(() => {
      console.log(`2. Promise ${++promiseCount}`);
      return Promise.resolve();
    })
    .then(() => {
      console.log(`3. Promise ${++promiseCount}`);
    });
  
  process.nextTick(() => console.log('4. nextTick (runs BEFORE all Promises)'));
  
  setTimeout(() => demo5(), 100);
}

function demo5() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('PART 4: INTERLEAVING (Mixing Queues)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('--- Demo 5: Promise schedules nextTick ---\n');
  
  Promise.resolve().then(() => {
    console.log('1. Promise callback');
    process.nextTick(() => console.log('2. nextTick from Promise'));
  });
  
  process.nextTick(() => {
    console.log('3. nextTick callback');
    Promise.resolve().then(() => console.log('4. Promise from nextTick'));
  });
  
  console.log('Expected: nextTick → Promise → nextTick → Promise');
  
  setTimeout(() => demo6(), 100);
}

function demo6() {
  console.log('\n--- Demo 6: Complex Interleaving ---\n');
  
  process.nextTick(() => {
    console.log('1. nextTick A');
    Promise.resolve().then(() => {
      console.log('2. Promise A (from nextTick A)');
      process.nextTick(() => console.log('3. nextTick B (from Promise A)'));
    });
  });
  
  Promise.resolve().then(() => {
    console.log('4. Promise B');
    process.nextTick(() => {
      console.log('5. nextTick C (from Promise B)');
      Promise.resolve().then(() => console.log('6. Promise C (from nextTick C)'));
    });
  });
  
  setTimeout(() => demo7(), 100);
}

function demo7() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('PART 5: QUEUEMICROTASK API');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('--- Demo 7: queueMicrotask vs Promise ---\n');
  
  queueMicrotask(() => console.log('1. queueMicrotask A'));
  Promise.resolve().then(() => console.log('2. Promise'));
  queueMicrotask(() => console.log('3. queueMicrotask B'));
  process.nextTick(() => console.log('4. nextTick'));
  
  console.log('queueMicrotask and Promise share the SAME queue');
  console.log('nextTick still has priority\n');
  
  setTimeout(() => demo8(), 100);
}

function demo8() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('PART 6: ASYNC/AWAIT (Promise-based)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('--- Demo 8: async/await microtask timing ---\n');
  
  async function asyncFunc() {
    console.log('1. Async function start (synchronous)');
    
    await Promise.resolve();
    console.log('2. After await (microtask)');
    
    process.nextTick(() => console.log('3. nextTick from async'));
  }
  
  process.nextTick(() => console.log('4. nextTick (scheduled before async)'));
  asyncFunc();
  Promise.resolve().then(() => console.log('5. Promise (scheduled after async)'));
  
  setTimeout(() => demo9(), 100);
}

function demo9() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('PART 7: DANGER ZONE - Event Loop Starvation');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('--- Demo 9: Infinite nextTick (DANGEROUS!) ---\n');
  console.log('⚠️  This will run for 1 second, blocking everything:\n');
  
  let count = 0;
  const startTime = Date.now();
  const maxTime = 1000; // Run for 1 second
  
  function recursiveNextTick() {
    count++;
    
    if (Date.now() - startTime < maxTime) {
      process.nextTick(recursiveNextTick); // Adds to queue immediately!
    } else {
      console.log(`\n💥 Executed ${count} nextTick callbacks in ${maxTime}ms`);
      console.log('Event loop was STARVED - no other work could run!\n');
      
      setTimeout(() => demo10(), 100);
    }
  }
  
  // This timer won't run until nextTick queue is empty
  setTimeout(() => console.log('This timer was blocked!'), 0);
  
  recursiveNextTick();
}

function demo10() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('PART 8: SAFE RECURSION - Using setImmediate');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('--- Demo 10: Safe recursion with setImmediate ---\n');
  
  let safeCount = 0;
  const safeStart = Date.now();
  const safeMax = 1000;
  
  function safeRecursive() {
    safeCount++;
    
    if (Date.now() - safeStart < safeMax) {
      setImmediate(safeRecursive); // Yields to event loop!
    } else {
      console.log(`✅ Executed ${safeCount} setImmediate callbacks in ${safeMax}ms`);
      console.log('Event loop remained responsive!\n');
      
      setTimeout(() => showTheory(), 100);
    }
  }
  
  // This timer CAN run between setImmediate calls
  let timerCount = 0;
  const timerInterval = setInterval(() => {
    timerCount++;
    console.log(`  Heartbeat ${timerCount} - Event loop is working!`);
  }, 200);
  
  setTimeout(() => {
    clearInterval(timerInterval);
  }, 1000);
  
  safeRecursive();
}

function showTheory() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('THEORETICAL SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('📊 COMPLETE PRIORITY HIERARCHY:\n');
  console.log('1. Synchronous Code');
  console.log('   └─> Runs to completion, cannot be interrupted\n');
  
  console.log('2. process.nextTick Queue ⚡');
  console.log('   ├─> Highest async priority');
  console.log('   ├─> Drains completely before anything else');
  console.log('   ├─> New nextTicks added during drain are included');
  console.log('   └─> ⚠️  Can starve event loop\n');
  
  console.log('3. Promise Microtask Queue 🔄');
  console.log('   ├─> Includes: Promise.then/catch/finally');
  console.log('   ├─> Includes: queueMicrotask()');
  console.log('   ├─> Includes: async/await continuations');
  console.log('   ├─> Drains completely after nextTick queue');
  console.log('   └─> New promises added during drain are included\n');
  
  console.log('4. Event Loop Phases');
  console.log('   ├─> Timers (setTimeout/setInterval)');
  console.log('   ├─> I/O callbacks (fs.readFile, etc.)');
  console.log('   ├─> setImmediate');
  console.log('   └─> After EACH callback: back to step 2\n');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('🔬 VISUAL MODEL:\n');
  console.log('┌────────────────────────────────────────────────────┐');
  console.log('│                 EVENT LOOP TICK                    │');
  console.log('└────────────────┬───────────────────────────────────┘');
  console.log('                 │');
  console.log('                 ▼');
  console.log('┌────────────────────────────────────────────────────┐');
  console.log('│ Execute 1 Callback (timer/I/O/setImmediate)       │');
  console.log('└────────────────┬───────────────────────────────────┘');
  console.log('                 │');
  console.log('                 ▼');
  console.log('┌────────────────────────────────────────────────────┐');
  console.log('│ Microtask Checkpoint                               │');
  console.log('├────────────────────────────────────────────────────┤');
  console.log('│ WHILE (nextTick queue NOT empty):                 │');
  console.log('│   ├─> Execute ALL nextTick callbacks ⚡            │');
  console.log('│   └─> (including newly added ones)                 │');
  console.log('│                                                    │');
  console.log('│ WHILE (Promise queue NOT empty):                  │');
  console.log('│   ├─> Execute ALL Promise callbacks 🔄            │');
  console.log('│   └─> (including newly added ones)                 │');
  console.log('└────────────────┬───────────────────────────────────┘');
  console.log('                 │');
  console.log('                 ▼');
  console.log('┌────────────────────────────────────────────────────┐');
  console.log('│ Continue to next callback or next phase            │');
  console.log('└────────────────────────────────────────────────────┘\n');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('⚖️  WHEN TO USE EACH:\n');
  
  console.log('USE process.nextTick when:');
  console.log('  ✅ Need to run before ANY async operation');
  console.log('  ✅ Initializing event emitters');
  console.log('  ✅ Deferring execution until call stack is empty');
  console.log('  ⚠️  Be careful - easy to starve event loop!\n');
  
  console.log('USE Promise/queueMicrotask when:');
  console.log('  ✅ Standard async operations');
  console.log('  ✅ Cross-platform code (works in browsers)');
  console.log('  ✅ Async/await patterns');
  console.log('  ✅ Generally safer than nextTick\n');
  
  console.log('USE setImmediate when:');
  console.log('  ✅ Breaking up long-running work');
  console.log('  ✅ Yielding to event loop');
  console.log('  ✅ Processing large arrays/datasets');
  console.log('  ✅ Preventing stack overflow in recursion\n');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('🎯 KEY TAKEAWAYS:\n');
  console.log('1. Two separate microtask queues exist');
  console.log('2. nextTick ALWAYS runs before Promises');
  console.log('3. Both queues drain COMPLETELY at each checkpoint');
  console.log('4. Microtasks can add more microtasks (recursive draining)');
  console.log('5. Checkpoint happens after EVERY callback execution');
  console.log('6. queueMicrotask === Promise queue (not nextTick)');
  console.log('7. async/await uses Promise microtask queue');
  console.log('8. Infinite nextTick can starve the event loop');
  console.log('9. Use setImmediate for safe work chunking');
  console.log('10. Understanding this is crucial for React, async patterns!\n');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('📚 FURTHER READING:\n');
  console.log('- Node.js Event Loop Documentation');
  console.log('- process.nextTick() best practices');
  console.log('- Microtask specification (ECMAScript)');
  console.log('- Difference between Node.js and browser event loops\n');
  
  process.exit(0);
}

console.log('Starting microtask prioritization demonstrations...\n');
console.log('Watch carefully how nextTick and Promises interleave!\n');
