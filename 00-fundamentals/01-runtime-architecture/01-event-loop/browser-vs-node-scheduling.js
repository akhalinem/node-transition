/**
 * Browser vs Node.js: Scheduling APIs Comparison
 * What React actually uses for concurrent features
 */

console.log('=== SCHEDULING APIs: BROWSER vs NODE.js ===\n');

// Check what's available in this runtime (Node.js)
console.log('Available in Node.js:');
console.log('✅ setImmediate:', typeof setImmediate !== 'undefined');
console.log('✅ setTimeout:', typeof setTimeout !== 'undefined');
console.log('✅ setInterval:', typeof setInterval !== 'undefined');
console.log('✅ process.nextTick:', typeof process !== 'undefined' && typeof process.nextTick !== 'undefined');
console.log('❌ MessageChannel:', typeof MessageChannel === 'undefined' ? 'Not in Node.js' : 'Available');
console.log('❌ requestIdleCallback:', typeof requestIdleCallback === 'undefined' ? 'Not in Node.js' : 'Available');
console.log('❌ requestAnimationFrame:', typeof requestAnimationFrame === 'undefined' ? 'Not in Node.js' : 'Available\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('Available in BROWSERS:');
console.log('❌ setImmediate: NO (removed from modern browsers)');
console.log('✅ setTimeout: YES');
console.log('✅ setInterval: YES');
console.log('✅ MessageChannel: YES ⭐️');
console.log('✅ requestIdleCallback: YES');
console.log('✅ requestAnimationFrame: YES');
console.log('❌ process.nextTick: NO (Node.js only)\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('What REACT uses for Concurrent Features:\n');
console.log('React Scheduler Priority:');
console.log('1. MessageChannel (primary in browsers) ⭐️');
console.log('2. setImmediate (in Node.js/SSR)');
console.log('3. setTimeout (fallback)\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('=== DEMO: React-like Scheduling Pattern ===\n');

// Simulating what React does (simplified)
console.log('React\'s approach (in browsers):\n');
console.log('```javascript');
console.log('// React Scheduler uses MessageChannel');
console.log('const channel = new MessageChannel();');
console.log('const port = channel.port2;');
console.log('');
console.log('channel.port1.onmessage = () => {');
console.log('  // Execute scheduled work');
console.log('  performWork();');
console.log('};');
console.log('');
console.log('function scheduleWork() {');
console.log('  port.postMessage(null); // Schedules a task');
console.log('}');
console.log('```\n');

console.log('Why MessageChannel over setTimeout?');
console.log('1. No minimum delay (setTimeout has ~4ms minimum)');
console.log('2. Not throttled when tab is background');
console.log('3. More predictable timing');
console.log('4. Better for frequent scheduling\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('=== TIMING COMPARISON ===\n');

// Demo: Compare setTimeout vs setImmediate timing
function testSetTimeout() {
  console.log('Testing setTimeout(fn, 0):');
  const times = [];
  let count = 0;
  const maxCount = 5;
  
  function measure() {
    const start = Date.now();
    setTimeout(() => {
      const delay = Date.now() - start;
      times.push(delay);
      count++;
      
      console.log(`  Iteration ${count}: ${delay}ms delay`);
      
      if (count < maxCount) {
        measure();
      } else {
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        console.log(`  Average delay: ${avg.toFixed(2)}ms\n`);
        testSetImmediate();
      }
    }, 0);
  }
  
  measure();
}

function testSetImmediate() {
  console.log('Testing setImmediate():');
  const times = [];
  let count = 0;
  const maxCount = 5;
  
  function measure() {
    const start = Date.now();
    setImmediate(() => {
      const delay = Date.now() - start;
      times.push(delay);
      count++;
      
      console.log(`  Iteration ${count}: ${delay}ms delay`);
      
      if (count < maxCount) {
        measure();
      } else {
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        console.log(`  Average delay: ${avg.toFixed(2)}ms\n`);
        showReactExample();
      }
    });
  }
  
  measure();
}

testSetTimeout();

function showReactExample() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('=== HOW REACT SCHEDULER WORKS (Simplified) ===\n');
  
  console.log('React breaks rendering into small chunks:\n');
  
  // Simulate React's time-slicing approach
  const tasks = Array.from({ length: 20 }, (_, i) => `Task ${i + 1}`);
  let taskIndex = 0;
  
  function performWork() {
    const startTime = Date.now();
    const timeSlice = 5; // 5ms time slice
    
    // Work until time slice expires
    while (taskIndex < tasks.length && (Date.now() - startTime) < timeSlice) {
      console.log(`  ⚛️  Processing: ${tasks[taskIndex]}`);
      taskIndex++;
      
      // Simulate work
      let sum = 0;
      for (let i = 0; i < 100000; i++) sum += i;
    }
    
    if (taskIndex < tasks.length) {
      console.log(`  ⏸️  Yielding to browser (processed ${taskIndex}/${tasks.length})`);
      // In browser: port.postMessage(null)
      // In Node.js: setImmediate(performWork)
      setImmediate(performWork);
    } else {
      console.log(`  ✅ All tasks complete!\n`);
      showComparison();
    }
  }
  
  console.log('Starting concurrent rendering simulation...\n');
  performWork();
}

function showComparison() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('SUMMARY: Browser vs Node.js Scheduling');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('┌─────────────────────────┬──────────┬───────────┐');
  console.log('│ API                     │ Browser  │ Node.js   │');
  console.log('├─────────────────────────┼──────────┼───────────┤');
  console.log('│ setImmediate            │    ❌    │    ✅     │');
  console.log('│ setTimeout              │    ✅    │    ✅     │');
  console.log('│ MessageChannel          │    ✅    │    ❌     │');
  console.log('│ requestIdleCallback     │    ✅    │    ❌     │');
  console.log('│ requestAnimationFrame   │    ✅    │    ❌     │');
  console.log('│ process.nextTick        │    ❌    │    ✅     │');
  console.log('└─────────────────────────┴──────────┴───────────┘\n');
  
  console.log('React Scheduler Uses:\n');
  console.log('🌐 Browser Environment:');
  console.log('   1. MessageChannel (best performance)');
  console.log('   2. setTimeout (fallback)\n');
  
  console.log('🖥️  Node.js/SSR Environment:');
  console.log('   1. setImmediate (best performance)');
  console.log('   2. setTimeout (fallback)\n');
  
  console.log('Key Differences:\n');
  console.log('MessageChannel (Browser):');
  console.log('  ✅ No minimum delay');
  console.log('  ✅ Not throttled in background');
  console.log('  ✅ Precise timing\n');
  
  console.log('setImmediate (Node.js):');
  console.log('  ✅ Runs after I/O events');
  console.log('  ✅ Prevents stack overflow');
  console.log('  ✅ Better than setTimeout(0)\n');
  
  console.log('setTimeout (Both):');
  console.log('  ⚠️  ~4ms minimum delay in browsers');
  console.log('  ⚠️  Throttled in background tabs');
  console.log('  ✅ Universal fallback\n');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('Want to see React Scheduler source code?');
  console.log('Check: packages/scheduler/src/forks/Scheduler.js');
  console.log('in the React repository!\n');
}
