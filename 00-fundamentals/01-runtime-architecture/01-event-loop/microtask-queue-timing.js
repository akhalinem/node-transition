/**
 * CRITICAL INSIGHT: When Do Microtasks Run?
 * 
 * Common Misconception:
 * ❌ Microtasks run after ALL callbacks in a phase complete
 * 
 * Reality:
 * ✅ Microtasks run after EACH callback in a phase completes
 */

console.log('=== MICROTASK TIMING: The Truth ===\n');

console.log('MISCONCEPTION (What you thought):');
console.log('┌─────────────────────────────────────────┐');
console.log('│ Timer Phase:                            │');
console.log('│  1. Execute ALL timer callbacks         │');
console.log('│     - setTimeout callback 1             │');
console.log('│     - setTimeout callback 2             │');
console.log('│     - setTimeout callback 3             │');
console.log('│  2. THEN process all microtasks         │');
console.log('│     - All Promises                      │');
console.log('│     - All process.nextTick              │');
console.log('└─────────────────────────────────────────┘\n');

console.log('REALITY (What actually happens):');
console.log('┌─────────────────────────────────────────┐');
console.log('│ Timer Phase:                            │');
console.log('│  1. Execute timer callback 1            │');
console.log('│  2. Check & run ALL microtasks          │');
console.log('│  3. Execute timer callback 2            │');
console.log('│  4. Check & run ALL microtasks          │');
console.log('│  5. Execute timer callback 3            │');
console.log('│  6. Check & run ALL microtasks          │');
console.log('└─────────────────────────────────────────┘\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('=== DEMONSTRATION ===\n');

// Demo 1: Multiple timers scheduled together
console.log('Test 1: Multiple setTimeout callbacks\n');

setTimeout(() => {
  console.log('⏰ Timer 1');
  Promise.resolve().then(() => console.log('  🔄 Microtask after Timer 1'));
}, 0);

setTimeout(() => {
  console.log('⏰ Timer 2');
  Promise.resolve().then(() => console.log('  🔄 Microtask after Timer 2'));
}, 0);

setTimeout(() => {
  console.log('⏰ Timer 3');
  Promise.resolve().then(() => console.log('  🔄 Microtask after Timer 3'));
}, 0);

setTimeout(() => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  runTest2();
}, 100);

function runTest2() {
  console.log('Test 2: Nested promises in timers\n');
  
  setTimeout(() => {
    console.log('⏰ Timer A');
    Promise.resolve()
      .then(() => {
        console.log('  🔄 Microtask A1');
        return Promise.resolve();
      })
      .then(() => console.log('  🔄 Microtask A2'));
  }, 0);
  
  setTimeout(() => {
    console.log('⏰ Timer B');
    Promise.resolve()
      .then(() => {
        console.log('  🔄 Microtask B1');
        return Promise.resolve();
      })
      .then(() => console.log('  🔄 Microtask B2'));
  }, 0);
  
  setTimeout(() => {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    runTest3();
  }, 100);
}

function runTest3() {
  console.log('Test 3: process.nextTick vs Promise in timers\n');
  
  setTimeout(() => {
    console.log('⏰ Timer X');
    process.nextTick(() => console.log('  ⚡ nextTick X'));
    Promise.resolve().then(() => console.log('  🔄 Promise X'));
  }, 0);
  
  setTimeout(() => {
    console.log('⏰ Timer Y');
    process.nextTick(() => console.log('  ⚡ nextTick Y'));
    Promise.resolve().then(() => console.log('  🔄 Promise Y'));
  }, 0);
  
  setTimeout(() => {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    showExplanation();
  }, 100);
}

function showExplanation() {
  console.log('=== THE RULE ===\n');
  
  console.log('After EVERY callback execution in ANY phase:');
  console.log('1. Check process.nextTick queue → drain completely');
  console.log('2. Check Promise microtask queue → drain completely');
  console.log('3. Continue to next callback in current phase\n');
  
  console.log('This happens in ALL event loop phases:');
  console.log('  • Timers phase');
  console.log('  • Pending callbacks phase');
  console.log('  • Poll phase');
  console.log('  • Check phase (setImmediate)');
  console.log('  • Close callbacks phase\n');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('=== VISUAL MODEL ===\n');
  console.log('Event Loop Execution:');
  console.log('');
  console.log('┌────────────────────────────────────────────────┐');
  console.log('│ TIMERS PHASE                                   │');
  console.log('├────────────────────────────────────────────────┤');
  console.log('│ Execute Timer Callback 1                       │');
  console.log('│   └─> Drain nextTick queue ⚡                  │');
  console.log('│   └─> Drain Promise queue 🔄                   │');
  console.log('├────────────────────────────────────────────────┤');
  console.log('│ Execute Timer Callback 2                       │');
  console.log('│   └─> Drain nextTick queue ⚡                  │');
  console.log('│   └─> Drain Promise queue 🔄                   │');
  console.log('├────────────────────────────────────────────────┤');
  console.log('│ Execute Timer Callback 3                       │');
  console.log('│   └─> Drain nextTick queue ⚡                  │');
  console.log('│   └─> Drain Promise queue 🔄                   │');
  console.log('└────────────────────────────────────────────────┘');
  console.log('         ⬇️  Move to next phase                  ');
  console.log('┌────────────────────────────────────────────────┐');
  console.log('│ PENDING CALLBACKS PHASE                        │');
  console.log('└────────────────────────────────────────────────┘\n');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('=== WHY THIS DESIGN? ===\n');
  
  console.log('Benefits of draining microtasks after each callback:');
  console.log('');
  console.log('✅ More responsive:');
  console.log('   High-priority microtasks run sooner\n');
  
  console.log('✅ More predictable:');
  console.log('   Promises resolve immediately after their trigger\n');
  
  console.log('✅ Better for React/async operations:');
  console.log('   State updates can process between timer callbacks\n');
  
  console.log('⚠️  Can cause starvation:');
  console.log('   If callbacks keep adding microtasks, phase never advances\n');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  showComparisonExample();
}

function showComparisonExample() {
  console.log('=== SIDE-BY-SIDE COMPARISON ===\n');
  
  console.log('Code:');
  console.log('─────────────────────────────────────────\n');
  console.log('setTimeout(() => {');
  console.log('  console.log("Timer 1");');
  console.log('  Promise.resolve().then(() => console.log("Promise 1"));');
  console.log('}, 0);');
  console.log('');
  console.log('setTimeout(() => {');
  console.log('  console.log("Timer 2");');
  console.log('  Promise.resolve().then(() => console.log("Promise 2"));');
  console.log('}, 0);\n');
  
  console.log('What you expected:          What actually happens:');
  console.log('──────────────────          ────────────────────');
  console.log('1. Timer 1                  1. Timer 1');
  console.log('2. Timer 2                  2. Promise 1  ⬅️  Runs immediately!');
  console.log('3. Promise 1                3. Timer 2');
  console.log('4. Promise 2                4. Promise 2  ⬅️  Runs immediately!\n');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('KEY TAKEAWAY:');
  console.log('════════════════════════════════════════════════════\n');
  console.log('Microtask queues are checked and drained after:');
  console.log('  ✅ EACH individual callback');
  console.log('  ❌ NOT after all callbacks in a phase\n');
  
  console.log('This gives microtasks higher priority and makes');
  console.log('async operations more responsive!\n');
  
  process.exit(0);
}
