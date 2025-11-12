/**
 * V8 ENGINE: DEEP DIVE INTO MEMORY MANAGEMENT
 * 
 * A comprehensive guide to understanding how V8 manages memory,
 * optimizes JavaScript, and performs garbage collection.
 */

console.log('═══════════════════════════════════════════════════════════');
console.log('  V8 MEMORY MANAGEMENT - COMPLETE GUIDE');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('PART 1: V8 MEMORY ARCHITECTURE');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('V8 organizes memory into TWO main areas:\n');

console.log('1. THE STACK (Call Stack)');
console.log('   ┌─────────────────────────────────────────┐');
console.log('   │ • Stores primitive values               │');
console.log('   │ • Stores references to heap objects     │');
console.log('   │ • Stores function execution contexts    │');
console.log('   │ • Fixed size per thread (~1MB)          │');
console.log('   │ • VERY FAST access (CPU cache)          │');
console.log('   │ • Automatically managed (LIFO)          │');
console.log('   │ • Stack overflow if exceeded            │');
console.log('   └─────────────────────────────────────────┘\n');

console.log('2. THE HEAP');
console.log('   ┌─────────────────────────────────────────┐');
console.log('   │ • Stores objects, arrays, functions     │');
console.log('   │ • Stores closures and their data        │');
console.log('   │ • Larger size (default ~1.4GB on 64-bit)│');
console.log('   │ • Slower than stack                     │');
console.log('   │ • Requires garbage collection           │');
console.log('   │ • Can be resized with flags             │');
console.log('   └─────────────────────────────────────────┘\n');

console.log('VISUALIZATION:\n');
console.log('┌─────────────────────────────────────────────────────┐');
console.log('│                    STACK                            │');
console.log('├─────────────────────────────────────────────────────┤');
console.log('│ num = 42                    [primitive value]       │');
console.log('│ isActive = true             [primitive value]       │');
console.log('│ obj = 0x1234                [reference to heap]  ──┐│');
console.log('│ arr = 0x5678                [reference to heap]  ──┼│');
console.log('└─────────────────────────────────────────────────────┘│');
console.log('                                                      ││');
console.log('                                                      ││');
console.log('┌─────────────────────────────────────────────────────┘│');
console.log('│                    HEAP                              │');
console.log('├──────────────────────────────────────────────────────┤');
console.log('│ 0x1234: { name: "John", age: 30 }  ←─────────────────┘');
console.log('│ 0x5678: [1, 2, 3, 4, 5]       ←──────────────────────┘');
console.log('│ 0xABCD: function greet() { ... }                     │');
console.log('│ ... (many more objects) ...                          │');
console.log('└──────────────────────────────────────────────────────┘\n');

// Demonstration
function stackVsHeapDemo() {
  // Stack allocation
  let x = 10;              // Stored on stack (primitive)
  let y = 20;              // Stored on stack (primitive)
  
  // Heap allocation
  let obj = { x: 10 };     // Reference on stack, object on heap
  let arr = [1, 2, 3];     // Reference on stack, array on heap
  
  console.log('Stack values (fast access):', x, y);
  console.log('Heap objects (via reference):', obj, arr);
}

stackVsHeapDemo();

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('PART 2: HEAP STRUCTURE (GENERATIONAL LAYOUT)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('The heap is divided into GENERATIONS:\n');

console.log('┌──────────────────────────────────────────────────────┐');
console.log('│                  V8 HEAP LAYOUT                      │');
console.log('├──────────────────────────────────────────────────────┤');
console.log('│                                                      │');
console.log('│  ┌─────────────────────────────────────────────┐    │');
console.log('│  │    NEW SPACE (Young Generation)             │    │');
console.log('│  │    Size: ~16MB (8MB semi-spaces × 2)        │    │');
console.log('│  ├─────────────────────────────────────────────┤    │');
console.log('│  │  FROM-SPACE  │  TO-SPACE                    │    │');
console.log('│  │  (active)    │  (inactive during allocation)│    │');
console.log('│  └─────────────────────────────────────────────┘    │');
console.log('│         ↓ (survives 2 GC cycles)                     │');
console.log('│  ┌─────────────────────────────────────────────┐    │');
console.log('│  │    OLD SPACE (Old Generation)               │    │');
console.log('│  │    Size: ~1.4GB (configurable)              │    │');
console.log('│  │    - Old Pointer Space (objects with refs)  │    │');
console.log('│  │    - Old Data Space (data only)             │    │');
console.log('│  └─────────────────────────────────────────────┘    │');
console.log('│                                                      │');
console.log('│  ┌─────────────────────────────────────────────┐    │');
console.log('│  │    LARGE OBJECT SPACE                       │    │');
console.log('│  │    Objects > 1MB allocated here directly    │    │');
console.log('│  └─────────────────────────────────────────────┘    │');
console.log('│                                                      │');
console.log('│  ┌─────────────────────────────────────────────┐    │');
console.log('│  │    CODE SPACE                               │    │');
console.log('│  │    Compiled code (JIT)                      │    │');
console.log('│  └─────────────────────────────────────────────┘    │');
console.log('│                                                      │');
console.log('│  ┌─────────────────────────────────────────────┐    │');
console.log('│  │    MAP SPACE                                │    │');
console.log('│  │    Hidden classes (object shapes)           │    │');
console.log('│  └─────────────────────────────────────────────┘    │');
console.log('└──────────────────────────────────────────────────────┘\n');

console.log('WHY GENERATIONS?\n');
console.log('The "Generational Hypothesis":');
console.log('  • Most objects die young (short-lived)');
console.log('  • Objects that survive tend to live long');
console.log('  • Optimizes GC by focusing on young objects\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('PART 3: GARBAGE COLLECTION ALGORITHMS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('V8 uses TWO different garbage collectors:\n');

console.log('═══════════════════════════════════════════════════════\n');
console.log('1. SCAVENGER (Minor GC) - For New Space\n');
console.log('═══════════════════════════════════════════════════════\n');

console.log('Algorithm: Cheney\'s Semi-Space Copying\n');

console.log('HOW IT WORKS:\n');
console.log('Step 1: Initial State');
console.log('┌──────────────────┬──────────────────┐');
console.log('│   FROM-SPACE     │    TO-SPACE      │');
console.log('│    (active)      │    (empty)       │');
console.log('├──────────────────┼──────────────────┤');
console.log('│ Obj A (alive)    │                  │');
console.log('│ Obj B (dead)     │                  │');
console.log('│ Obj C (alive)    │                  │');
console.log('│ Obj D (dead)     │                  │');
console.log('└──────────────────┴──────────────────┘\n');

console.log('Step 2: During GC (Scavenging)');
console.log('┌──────────────────┬──────────────────┐');
console.log('│   FROM-SPACE     │    TO-SPACE      │');
console.log('│  (being scanned) │  (being filled)  │');
console.log('├──────────────────┼──────────────────┤');
console.log('│ Obj A ────────────→ Obj A (copied)  │');
console.log('│ Obj B (ignored)  │                  │');
console.log('│ Obj C ────────────→ Obj C (copied)  │');
console.log('│ Obj D (ignored)  │                  │');
console.log('└──────────────────┴──────────────────┘\n');

console.log('Step 3: After GC');
console.log('┌──────────────────┬──────────────────┐');
console.log('│   FROM-SPACE     │    TO-SPACE      │');
console.log('│    (now empty)   │  (now active)    │');
console.log('├──────────────────┼──────────────────┤');
console.log('│                  │ Obj A (alive)    │');
console.log('│                  │ Obj C (alive)    │');
console.log('│   (spaces swap)  │                  │');
console.log('└──────────────────┴──────────────────┘\n');

console.log('Characteristics:');
console.log('  • FAST: Only copies live objects');
console.log('  • Stops the world: Pauses JS execution');
console.log('  • Runs frequently (~1-2ms pauses)');
console.log('  • Survives 2 scavenges → promoted to Old Space\n');

console.log('═══════════════════════════════════════════════════════\n');
console.log('2. MARK-SWEEP-COMPACT (Major GC) - For Old Space\n');
console.log('═══════════════════════════════════════════════════════\n');

console.log('Algorithm: Tri-color Marking + Compaction\n');

console.log('PHASE 1: MARKING\n');
console.log('Step 1: Start from roots (global, stack)');
console.log('┌────────────────────────────────────┐');
console.log('│ All objects initially WHITE (dead) │');
console.log('└────────────────────────────────────┘\n');

console.log('Step 2: Mark reachable objects');
console.log('       ROOT (Stack/Global)');
console.log('         │');
console.log('         ├──→ Obj A [GRAY] (found, not scanned)');
console.log('         │    ├──→ Obj B [WHITE] (not yet found)');
console.log('         │    └──→ Obj C [WHITE]');
console.log('         │');
console.log('         └──→ Obj D [GRAY]');
console.log('              └──→ Obj E [WHITE]\n');

console.log('Step 3: Process gray objects');
console.log('       ROOT');
console.log('         │');
console.log('         ├──→ Obj A [BLACK] (scanned, alive)');
console.log('         │    ├──→ Obj B [GRAY] (found)');
console.log('         │    └──→ Obj C [GRAY] (found)');
console.log('         │');
console.log('         └──→ Obj D [GRAY] (being scanned)');
console.log('              └──→ Obj E [GRAY]\n');

console.log('Step 4: All reachable objects marked BLACK');
console.log('       BLACK = Alive, WHITE = Dead\n');

console.log('PHASE 2: SWEEPING');
console.log('┌─────────────────────────────────────────────┐');
console.log('│ Before Sweep:                               │');
console.log('│ [Obj A:BLACK] [Obj B:WHITE] [Obj C:BLACK]  │');
console.log('│ [Obj D:WHITE] [Obj E:BLACK]                │');
console.log('└─────────────────────────────────────────────┘');
console.log('              ↓ Free WHITE objects');
console.log('┌─────────────────────────────────────────────┐');
console.log('│ After Sweep:                                │');
console.log('│ [Obj A] [FREE SPACE] [Obj C] [FREE] [Obj E]│');
console.log('└─────────────────────────────────────────────┘\n');

console.log('PHASE 3: COMPACTING (Optional)');
console.log('┌─────────────────────────────────────────────┐');
console.log('│ Before Compact:                             │');
console.log('│ [Obj A] [FREE SPACE] [Obj C] [FREE] [Obj E]│');
console.log('└─────────────────────────────────────────────┘');
console.log('              ↓ Move objects together');
console.log('┌─────────────────────────────────────────────┐');
console.log('│ After Compact:                              │');
console.log('│ [Obj A][Obj C][Obj E] [FREE SPACE──────────]│');
console.log('└─────────────────────────────────────────────┘\n');

console.log('Characteristics:');
console.log('  • SLOWER than Scavenger');
console.log('  • Runs less frequently');
console.log('  • Can pause for 10-100ms+');
console.log('  • Uses incremental marking to reduce pauses');
console.log('  • Concurrent marking (doesn\'t stop the world)\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('PART 4: HIDDEN CLASSES (OBJECT SHAPES)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('V8 creates "hidden classes" to optimize property access\n');

console.log('EXAMPLE: Creating objects with same structure\n');

console.log('Code:');
console.log('  function Point(x, y) {');
console.log('    this.x = x;');
console.log('    this.y = y;');
console.log('  }\n');

console.log('Hidden Class Evolution:');
console.log('┌──────────────────────────────────────────────────┐');
console.log('│ Step 1: Empty object created                     │');
console.log('│   Hidden Class: C0                               │');
console.log('│   Properties: (none)                             │');
console.log('└──────────────────────────────────────────────────┘');
console.log('                    ↓ add property "x"');
console.log('┌──────────────────────────────────────────────────┐');
console.log('│ Step 2: Added property "x"                       │');
console.log('│   Hidden Class: C1                               │');
console.log('│   Properties: x at offset 0                      │');
console.log('└──────────────────────────────────────────────────┘');
console.log('                    ↓ add property "y"');
console.log('┌──────────────────────────────────────────────────┐');
console.log('│ Step 3: Added property "y"                       │');
console.log('│   Hidden Class: C2                               │');
console.log('│   Properties: x at offset 0, y at offset 1       │');
console.log('└──────────────────────────────────────────────────┘\n');

// Good: Consistent structure
function Point(x, y) {
  this.x = x;  // Always add x first
  this.y = y;  // Always add y second
}

const p1 = new Point(1, 2);
const p2 = new Point(3, 4);

console.log('✅ GOOD: p1 and p2 share hidden class C2');
console.log('   Fast property access via inline caching\n');

// Bad: Inconsistent structure
const p3 = { x: 1, y: 2 };  // Hidden class C2
const p4 = { y: 2, x: 1 };  // Hidden class C3 (different!)

console.log('❌ BAD: p3 and p4 have DIFFERENT hidden classes');
console.log('   Property order matters!\n');

// Worse: Dynamic property addition
const p5 = { x: 1 };       // Hidden class C1
p5.y = 2;                  // Transitions to hidden class C2
// But now p5 went through TWO transitions (slower)

console.log('⚠️  WORSE: p5 has transition chain C0 → C1 → C2');
console.log('   Every transition costs performance\n');

console.log('INLINE CACHING:\n');
console.log('When V8 sees: obj.x');
console.log('First call:  Check hidden class → find x offset → cache result');
console.log('Next calls:  If same hidden class → use cached offset (FAST!)');
console.log('If different hidden class → cache miss → polymorphic/megamorphic\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('PART 5: MEMORY LEAKS - COMMON PATTERNS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('LEAK #1: Accidental Globals\n');
console.log('function leak1() {');
console.log('  oops = "I\'m global!";  // No var/let/const');
console.log('}');
console.log('// "oops" is now on global object, never GC\'d\n');

console.log('LEAK #2: Forgotten Timers\n');
console.log('const data = new Array(1000000);');
console.log('setInterval(() => {');
console.log('  console.log(data.length); // Holds reference forever!');
console.log('}, 1000);');
console.log('// Timer and data never get GC\'d\n');

console.log('LEAK #3: Closures Holding References\n');
console.log('function createClosure() {');
console.log('  const bigData = new Array(1000000);');
console.log('  return function() {');
console.log('    return bigData[0]; // Closure keeps bigData alive');
console.log('  };');
console.log('}');
console.log('const fn = createClosure();');
console.log('// bigData is held in memory as long as fn exists\n');

console.log('LEAK #4: Detached DOM Nodes (in browsers)\n');
console.log('const div = document.createElement("div");');
console.log('document.body.appendChild(div);');
console.log('document.body.removeChild(div);');
console.log('// div still in memory if you keep reference!\n');

console.log('LEAK #5: Event Listeners\n');
console.log('const handler = () => { /* ... */ };');
console.log('element.addEventListener("click", handler);');
console.log('// Remove element but forget to removeEventListener');
console.log('// Handler keeps element alive!\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('PART 6: MONITORING AND PROFILING');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const usage = process.memoryUsage();
console.log('Current Memory Usage:');
console.log(`  RSS (Resident Set Size):  ${(usage.rss / 1024 / 1024).toFixed(2)} MB`);
console.log(`    → Total memory allocated for process\n`);

console.log(`  Heap Total:               ${(usage.heapTotal / 1024 / 1024).toFixed(2)} MB`);
console.log(`    → Total heap size allocated by V8\n`);

console.log(`  Heap Used:                ${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
console.log(`    → Actually used by JS objects\n`);

console.log(`  External:                 ${(usage.external / 1024 / 1024).toFixed(2)} MB`);
console.log(`    → Memory used by C++ objects bound to JS\n`);

console.log(`  Array Buffers:            ${(usage.arrayBuffers / 1024 / 1024).toFixed(2)} MB`);
console.log(`    → Memory for ArrayBuffers and SharedArrayBuffers\n`);

console.log('Heap Usage Percentage:     ' + 
  `${((usage.heapUsed / usage.heapTotal) * 100).toFixed(1)}%\n`);

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('PART 7: V8 FLAGS AND OPTIMIZATION');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('MEMORY FLAGS:\n');
console.log('  --max-old-space-size=4096');
console.log('    → Increase old space to 4GB (default ~1.4GB)\n');

console.log('  --max-semi-space-size=16');
console.log('    → Increase new space size (default 8MB per semi-space)\n');

console.log('DEBUGGING FLAGS:\n');
console.log('  --expose-gc');
console.log('    → Expose global.gc() function for manual GC\n');

console.log('  --trace-gc');
console.log('    → Print GC events to console\n');

console.log('  --trace-gc-verbose');
console.log('    → Detailed GC information\n');

console.log('  --prof');
console.log('    → Generate V8 profiler output\n');

console.log('  --inspect');
console.log('    → Enable Chrome DevTools debugging\n');

console.log('  --inspect-brk');
console.log('    → Start with debugger paused\n');

console.log('OPTIMIZATION FLAGS:\n');
console.log('  --optimize-for-size');
console.log('    → Optimize for memory over speed\n');

console.log('  --no-opt');
console.log('    → Disable JIT optimization (debug only)\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('BEST PRACTICES SUMMARY');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('✅ DO:\n');
console.log('  1. Keep object shapes consistent');
console.log('     const p = { x: 1, y: 2 }; // Always same order\n');

console.log('  2. Initialize all properties in constructor');
console.log('     function Point(x, y) { this.x = x; this.y = y; }\n');

console.log('  3. Use object pooling for frequent allocations');
console.log('     const pool = []; // Reuse objects instead of creating new\n');

console.log('  4. Clean up timers and event listeners');
console.log('     clearInterval(timer); element.removeEventListener(...)\n');

console.log('  5. Monitor memory usage in production');
console.log('     setInterval(() => console.log(process.memoryUsage()), 60000)\n');

console.log('  6. Use WeakMap/WeakSet for caching');
console.log('     const cache = new WeakMap(); // Allows GC\n');

console.log('❌ DON\'T:\n');
console.log('  1. Add properties dynamically after creation');
console.log('     obj.newProp = value; // Changes hidden class\n');

console.log('  2. Delete properties');
console.log('     delete obj.prop; // Puts object in "dictionary mode"\n');

console.log('  3. Use different property orders');
console.log('     { x: 1, y: 2 } vs { y: 2, x: 1 } // Different classes\n');

console.log('  4. Create accidental globals');
console.log('     leak = "oops"; // Use let/const/var!\n');

console.log('  5. Hold large data in closures unnecessarily');
console.log('     return () => bigArray[0]; // Keeps entire array alive\n');

console.log('\n💡 Remember: Understanding V8 helps you write faster,');
console.log('   more memory-efficient JavaScript!\n');
