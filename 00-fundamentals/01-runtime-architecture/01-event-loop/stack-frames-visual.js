/**
 * Visual Demonstration: Stack Frames with and without setImmediate
 * Shows exactly what happens on the call stack
 */

console.log('=== VISUALIZATION: Stack Frames ===\n');

// Helper to visualize the call stack
function visualizeStack(depth, label) {
  const stack = [];
  for (let i = depth; i >= 1; i--) {
    stack.push(`  processNext() #${i}`);
  }
  console.log(`${label}:`);
  console.log('Call Stack:');
  console.log(stack.join('\n'));
  console.log(`└─ DEPTH: ${depth} frames\n`);
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('SCENARIO 1: WITHOUT setImmediate (SYNCHRONOUS RECURSION)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

function demonstrateStackOverflow() {
  const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // Small array for demo
  let index = 0;
  let currentDepth = 0;
  
  function processNextSync() {
    currentDepth++;
    
    // Visualize at key points
    if (currentDepth === 1) {
      console.log('📍 STEP 1: First call to processNext()');
      visualizeStack(currentDepth, 'Stack State');
    }
    
    if (index < array.length) {
      console.log(`Processing array[${index}] = ${array[index]}`);
      index++;
      
      if (currentDepth === 3) {
        console.log('📍 STEP 2: After 3 recursive calls');
        visualizeStack(currentDepth, 'Stack State');
      }
      
      if (currentDepth === 5) {
        console.log('📍 STEP 3: After 5 recursive calls');
        visualizeStack(currentDepth, 'Stack State');
      }
      
      // Recursive call WITHOUT setImmediate
      processNextSync(); // Stack keeps growing!
      
    } else {
      console.log('📍 STEP 4: Reached the end (index 10)');
      visualizeStack(currentDepth, 'Stack State');
      console.log('🔥 Stack is at MAXIMUM depth: 10 frames!');
      console.log('💥 With 10,000 items, this would exceed ~9,000 frame limit!\n');
    }
    
    currentDepth--;
  }
  
  processNextSync();
  
  console.log('📍 STEP 5: After all calls return');
  console.log('Call Stack:');
  console.log('  [empty]');
  console.log('└─ DEPTH: 0 frames\n');
}

demonstrateStackOverflow();

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('SCENARIO 2: WITH setImmediate (ASYNCHRONOUS ITERATION)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

function demonstrateSetImmediate() {
  const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  let index = 0;
  let callCount = 0;
  
  function processNextAsync() {
    callCount++;
    const currentCall = callCount;
    
    if (index < array.length) {
      console.log(`\n📍 CALL #${currentCall}: Processing array[${index}] = ${array[index]}`);
      console.log('Call Stack:');
      console.log(`  processNextAsync() #${currentCall}`);
      console.log('└─ DEPTH: 1 frame ✅');
      
      index++;
      
      console.log(`\n  → Scheduling next call with setImmediate()`);
      console.log(`  → Current call #${currentCall} RETURNS immediately`);
      console.log(`  → Stack clears...`);
      
      // Schedule next iteration
      setImmediate(processNextAsync);
      
      console.log('\nCall Stack after return:');
      console.log('  [empty]');
      console.log('└─ DEPTH: 0 frames');
      console.log('  (Event loop will pick up scheduled call next)');
      
    } else {
      console.log(`\n📍 FINAL CALL #${currentCall}: Reached the end`);
      console.log('Call Stack:');
      console.log(`  processNextAsync() #${currentCall}`);
      console.log('└─ DEPTH: 1 frame ✅');
      console.log('\n✅ Maximum stack depth was ALWAYS 1 frame!');
      console.log('✅ Could process 1,000,000 items safely!\n');
      
      setTimeout(showComparison, 100);
    }
  }
  
  processNextAsync();
}

setTimeout(demonstrateSetImmediate, 500);

function showComparison() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('COMPARISON SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('WITHOUT setImmediate (Synchronous):');
  console.log('┌─────────────────────────────────────────┐');
  console.log('│ Call Stack                              │');
  console.log('├─────────────────────────────────────────┤');
  console.log('│ processNext() #10,000                   │');
  console.log('│   processNext() #9,999                  │');
  console.log('│     processNext() #9,998                │');
  console.log('│       processNext() #9,997              │');
  console.log('│         ...                             │');
  console.log('│           processNext() #3              │');
  console.log('│             processNext() #2            │');
  console.log('│               processNext() #1          │');
  console.log('├─────────────────────────────────────────┤');
  console.log('│ DEPTH: 10,000 frames                    │');
  console.log('│ RESULT: 💥 STACK OVERFLOW!              │');
  console.log('└─────────────────────────────────────────┘\n');
  
  console.log('WITH setImmediate (Asynchronous):');
  console.log('┌─────────────────────────────────────────┐');
  console.log('│ Call #1:                                │');
  console.log('│   processNext() #1 → returns            │');
  console.log('│   [stack clears]                        │');
  console.log('├─────────────────────────────────────────┤');
  console.log('│ Call #2:                                │');
  console.log('│   processNext() #2 → returns            │');
  console.log('│   [stack clears]                        │');
  console.log('├─────────────────────────────────────────┤');
  console.log('│ Call #3:                                │');
  console.log('│   processNext() #3 → returns            │');
  console.log('│   [stack clears]                        │');
  console.log('├─────────────────────────────────────────┤');
  console.log('│ ... continues for all 10,000 items      │');
  console.log('├─────────────────────────────────────────┤');
  console.log('│ DEPTH: Always 1 frame!                  │');
  console.log('│ RESULT: ✅ NO STACK OVERFLOW!           │');
  console.log('└─────────────────────────────────────────┘\n');
  
  console.log('KEY INSIGHT:');
  console.log('═══════════════════════════════════════════════════\n');
  console.log('Synchronous recursion:  depth = number_of_items');
  console.log('Asynchronous iteration: depth = 1 (always!)\n');
  console.log('setImmediate() converts recursion into iteration');
  console.log('through the event loop, preventing stack overflow!\n');
  
  demonstrateRealStackLimit();
}

function demonstrateRealStackLimit() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('BONUS: Testing Real Stack Limit on Your System');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  let depth = 0;
  
  function recurse() {
    depth++;
    if (depth % 1000 === 0) {
      console.log(`  Stack depth: ${depth}...`);
    }
    recurse();
  }
  
  try {
    recurse();
  } catch (e) {
    console.log(`\n💥 CRASHED at depth: ${depth} frames`);
    console.log(`Error: ${e.message}\n`);
    
    console.log('This is why arrays with 10,000+ items crash!');
    console.log(`Your system limit: ~${depth} frames`);
    console.log(`Your array size:   10,000 items`);
    console.log(`Result: 10,000 > ${depth} → 💥 Stack Overflow!\n`);
    
    process.exit(0);
  }
}
