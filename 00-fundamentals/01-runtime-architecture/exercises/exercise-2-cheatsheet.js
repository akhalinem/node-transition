/**
 * EXERCISE 2: Quick Reference & Cheat Sheet
 * Use this while solving the exercise
 */

console.log('═══════════════════════════════════════════════════════');
console.log('  EVENT LOOP CHEAT SHEET - Exercise 2 Helper');
console.log('═══════════════════════════════════════════════════════\n');

console.log('📋 EVENT LOOP PHASES (in order):\n');
console.log('  1. ⏱️  TIMERS        - setTimeout/setInterval callbacks');
console.log('  2. 📝 PENDING        - System callbacks (TCP errors, etc.)');
console.log('  3. 🔄 IDLE/PREPARE   - Internal use only');
console.log('  4. 📊 POLL           - I/O callbacks (fs.readFile, etc.)');
console.log('  5. ✅ CHECK          - setImmediate callbacks');
console.log('  6. 🔌 CLOSE          - close event callbacks\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('🎯 MICROTASK EXECUTION RULE:\n');
console.log('  After EACH callback execution:');
console.log('    1. Drain nextTick queue completely ⚡');
console.log('    2. Drain Promise queue completely 🔄');
console.log('    3. Continue to next callback\n');

console.log('  ┌─────────────────────────────────┐');
console.log('  │ Execute Callback                │');
console.log('  └───────────┬─────────────────────┘');
console.log('              ↓');
console.log('  ┌─────────────────────────────────┐');
console.log('  │ Process ALL nextTick            │');
console.log('  └───────────┬─────────────────────┘');
console.log('              ↓');
console.log('  ┌─────────────────────────────────┐');
console.log('  │ Process ALL Promises            │');
console.log('  └───────────┬─────────────────────┘');
console.log('              ↓');
console.log('  ┌─────────────────────────────────┐');
console.log('  │ Next Callback (or next phase)   │');
console.log('  └─────────────────────────────────┘\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('⚡ PRIORITY ORDER:\n');
console.log('  1. Synchronous code (always first)');
console.log('  2. process.nextTick (highest async priority)');
console.log('  3. Promise microtasks');
console.log('  4. Event loop phases (timers, I/O, etc.)\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('🔥 CRITICAL RULES:\n');

console.log('Rule 1: SYNCHRONOUS FIRST');
console.log('  All synchronous code runs before ANY async callback\n');

console.log('Rule 2: MICROTASKS INTERRUPT');
console.log('  Microtasks run after EACH callback, not after phases');
console.log('  Example:');
console.log('    setTimeout → microtasks → setTimeout → microtasks\n');

console.log('Rule 3: NEXTTICK > PROMISE');
console.log('  process.nextTick always drains before Promise queue\n');

console.log('Rule 4: I/O CONTEXT SPECIAL');
console.log('  Inside I/O callbacks:');
console.log('    setImmediate runs BEFORE setTimeout(fn, 0)');
console.log('  Outside I/O callbacks:');
console.log('    Order can vary (not deterministic)\n');

console.log('Rule 5: SCHEDULING IS DEFERRED');
console.log('  New timers/setImmediate scheduled in callbacks');
console.log('  don\'t run immediately - they run in future loops\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('📝 PREDICTION STRATEGY:\n');

console.log('Step 1: Mark all SYNCHRONOUS output');
console.log('Step 2: List IMMEDIATE microtasks (nextTick, Promise)');
console.log('Step 3: Process microtasks completely');
console.log('Step 4: Enter TIMERS phase');
console.log('  - After each timer: drain microtasks');
console.log('Step 5: Enter POLL phase (I/O callbacks)');
console.log('  - After each I/O callback: drain microtasks');
console.log('Step 6: Enter CHECK phase (setImmediate)');
console.log('  - After each setImmediate: drain microtasks');
console.log('Step 7: Repeat loop with any newly scheduled work\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('📊 TRACKING TABLE FORMAT:\n');
console.log('┌──────┬─────────────┬──────────┬─────────────────┐');
console.log('│ Step │ Phase       │ Output   │ Microtasks      │');
console.log('├──────┼─────────────┼──────────┼─────────────────┤');
console.log('│  1   │ Sync        │ 1        │ -               │');
console.log('│  2   │ Microtasks  │ 2        │ nextTick        │');
console.log('│  3   │ Microtasks  │ 4        │ Promise         │');
console.log('│  4   │ Timers      │ 6        │ -               │');
console.log('│  5   │ Microtasks  │ 7        │ nextTick        │');
console.log('│ ...  │ ...         │ ...      │ ...             │');
console.log('└──────┴─────────────┴──────────┴─────────────────┘\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('💡 DEBUGGING TIPS:\n');

console.log('1. Use console.trace() to see call stack:');
console.log('   console.trace("At this point");\n');

console.log('2. Add labels to track execution:');
console.log('   console.log("[TIMER-1]", "Output 6");\n');

console.log('3. Slow motion execution:');
console.log('   Uncomment the slow-motion code in the exercise\n');

console.log('4. Draw the event loop:');
console.log('   Visual representation helps immensely!\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('⚠️  COMMON TRAPS IN THIS EXERCISE:\n');

console.log('Trap 1: Forgetting microtasks after EACH callback');
console.log('Trap 2: I/O context changes setImmediate/setTimeout order');
console.log('Trap 3: Promises can schedule nextTick (queue mixing)');
console.log('Trap 4: Nested promises create chained microtasks');
console.log('Trap 5: fs.readFile completes in POLL, not immediately\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('🎯 READY TO SOLVE?\n');
console.log('1. Open: exercise-2-event-loop.js');
console.log('2. Predict the output (write it down!)');
console.log('3. Run: node exercise-2-event-loop.js');
console.log('4. Compare with solution: node exercise-2-event-loop-solution.js\n');

console.log('Good luck! 🚀\n');
