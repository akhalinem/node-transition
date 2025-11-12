# V8 Memory Management - Visual Reference Guide

## 🧠 Memory Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    NODE.JS PROCESS                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              CALL STACK (~1MB)                        │ │
│  ├───────────────────────────────────────────────────────┤ │
│  │  function context 3                                   │ │
│  │  function context 2                                   │ │
│  │  function context 1 (current)                         │ │
│  │  ├─ local var a = 42        [primitive]              │ │
│  │  ├─ local var obj = 0xABCD  [heap reference] ────┐   │ │
│  │  └─ local var arr = 0x1234  [heap reference] ────┼─┐ │ │
│  └───────────────────────────────────────────────────┼───┼─┘ │
│                                                       │   │   │
│  ┌───────────────────────────────────────────────────┼───┼─┐ │
│  │              V8 HEAP (~1.4GB default)             │   │ │ │
│  ├───────────────────────────────────────────────────────┤ │
│  │                                                       │ │ │
│  │  NEW SPACE (Young Generation) ~16MB                   │ │ │
│  │  ┌────────────────┬────────────────┐                  │ │ │
│  │  │  FROM-SPACE    │  TO-SPACE      │                  │ │ │
│  │  │  (8MB active)  │  (8MB standby) │                  │ │ │
│  │  │  - New objects │  - Copy dest.  │                  │ │ │
│  │  │  - Fast alloc  │  - GC target   │                  │ │ │
│  │  └────────────────┴────────────────┘                  │ │ │
│  │          ↓ Survives 2 GCs                             │ │ │
│  │  ┌─────────────────────────────────┐                  │ │ │
│  │  │  OLD SPACE (Old Generation)     │                  │ │ │
│  │  │  - Long-lived objects           │                  │ │ │
│  │  │  - Promoted from new space      │                  │ │ │
│  │  │ 0xABCD: { x: 1, y: 2 } ←────────┼──────────────────┘ │ │
│  │  │ 0x1234: [1, 2, 3, 4, 5] ←───────┼────────────────────┘ │
│  │  └─────────────────────────────────┘                    │ │
│  │                                                          │ │
│  │  LARGE OBJECT SPACE (>1MB objects)                      │ │
│  │  CODE SPACE (JIT compiled code)                         │ │
│  │  MAP SPACE (Hidden classes/shapes)                      │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Garbage Collection Cycle

### Minor GC (Scavenger) - Fast & Frequent

```
BEFORE GC:
┌─────────────────┬─────────────────┐
│   FROM-SPACE    │   TO-SPACE      │
│   (8MB used)    │   (empty)       │
├─────────────────┼─────────────────┤
│ [ObjA] ✓ alive  │                 │
│ [ObjB] ✗ dead   │                 │
│ [ObjC] ✓ alive  │                 │
│ [ObjD] ✗ dead   │                 │
│ [ObjE] ✓ alive  │                 │
└─────────────────┴─────────────────┘

DURING GC (1-2ms pause):
┌─────────────────┬─────────────────┐
│   FROM-SPACE    │   TO-SPACE      │
│  (scanning...)  │  (copying...)   │
├─────────────────┼─────────────────┤
│ ObjA ─────────> │ [ObjA] copied   │
│ ObjB (ignored)  │                 │
│ ObjC ─────────> │ [ObjC] copied   │
│ ObjD (ignored)  │                 │
│ ObjE ─────────> │ [ObjE] copied   │
└─────────────────┴─────────────────┘

AFTER GC:
┌─────────────────┬─────────────────┐
│   FROM-SPACE    │   TO-SPACE      │
│   (now empty)   │  (now active)   │
├─────────────────┼─────────────────┤
│                 │ [ObjA] ✓        │
│ (spaces swap)   │ [ObjC] ✓        │
│                 │ [ObjE] ✓        │
│ Free 5MB!       │ (3MB used)      │
└─────────────────┴─────────────────┘
```

**Characteristics:**

- ⚡ **Fast**: 1-2ms pause
- 🔄 **Frequent**: Every time new space fills
- 📊 **Efficient**: Only copies live objects
- 🎯 **Targets**: Short-lived objects (90%+ die quickly)

### Major GC (Mark-Sweep-Compact) - Slower & Rare

```
PHASE 1: MARKING (Tri-color)
═══════════════════════════════

Initial:  All objects = WHITE (dead)

Step 1 - Start from roots:
    ROOT (Stack/Global)
      ↓
   [WHITE] objects

Step 2 - Mark reachable:
    ROOT
    ├─→ A [GRAY]  ← Found, not scanned yet
    │   ├─→ B [WHITE]
    │   └─→ C [WHITE]
    └─→ D [GRAY]

Step 3 - Process GRAY:
    ROOT
    ├─→ A [BLACK] ← Scanned, definitely alive
    │   ├─→ B [GRAY]  ← Now found
    │   └─→ C [GRAY]
    └─→ D [BLACK]

Final: BLACK = alive, WHITE = dead

PHASE 2: SWEEPING
═══════════════════════════════

Before:
[A:BLACK] [B:WHITE] [C:BLACK] [D:WHITE] [E:BLACK]

Sweep:
[A:KEEP] [B:FREE!] [C:KEEP] [D:FREE!] [E:KEEP]

After:
[A] [FREE SPACE] [C] [FREE SPACE] [E]

PHASE 3: COMPACTING (optional)
═══════════════════════════════

Before:
[A] [FREE] [C] [FREE] [E] [FREE ─────────]
Memory fragmented!

After:
[A][C][E] [FREE SPACE ───────────────────]
Contiguous memory!
```

**Characteristics:**

- 🐌 **Slower**: 10-100ms+ pause
- 📅 **Rare**: Only when old space fills
- 🔍 **Thorough**: Scans entire old generation
- ⚙️ **Optimized**: Incremental & concurrent marking

---

## 🗺️ Hidden Classes (Object Shapes)

### The Problem: Dynamic Objects

```javascript
// JavaScript
const obj = { x: 1, y: 2 };
console.log(obj.x);
```

**Without Hidden Classes:**

- Hash table lookup: O(n) time
- No optimization possible
- Slow property access

**With Hidden Classes:**

- Direct memory offset: O(1) time
- Inline caching possible
- Fast property access

### Hidden Class Transitions

```
GOOD PATTERN: ✅ Consistent structure

function Point(x, y) {
  this.x = x;  // Transition: C0 → C1
  this.y = y;  // Transition: C1 → C2
}

const p1 = new Point(1, 2);  // Hidden class: C2
const p2 = new Point(3, 4);  // Hidden class: C2 (shared!)

    C0 (empty)
     ↓ add x
    C1 (has x)
     ↓ add y
    C2 (has x, y)

Both p1 and p2 share C2 → FAST ACCESS!


BAD PATTERN: ❌ Different orders

const p3 = { x: 1, y: 2 };  // C0 → C1(x) → C2(x,y)
const p4 = { y: 2, x: 1 };  // C0 → C3(y) → C4(y,x)

    C0
   ↙  ↘
  C1   C3    Different hidden classes!
   ↓    ↓
  C2   C4

p3 and p4 have DIFFERENT hidden classes → SLOW!


WORSE PATTERN: ⚠️ Dynamic addition

const p5 = {};      // Hidden class: C0
p5.x = 1;           // Transition: C0 → C1
p5.y = 2;           // Transition: C1 → C2

Multiple transitions → even slower!
```

### Inline Caching

```
First call to getX(obj):
┌─────────────────────────────┐
│ 1. Check obj's hidden class │
│ 2. Look up 'x' property     │ ← Slow
│ 3. Find offset: +0 bytes    │
│ 4. Cache result             │
└─────────────────────────────┘

Subsequent calls:
┌─────────────────────────────┐
│ 1. Hidden class matches?    │
│    ✓ Yes! Use cached offset │ ← FAST!
│ 2. Read from offset +0      │
└─────────────────────────────┘

Cache miss (different hidden class):
┌─────────────────────────────┐
│ 1. Hidden class different   │
│ 2. Lookup again (slow)      │
│ 3. Polymorphic/Megamorphic  │ ← Very slow
└─────────────────────────────┘
```

---

## 💧 Memory Leak Patterns

### Leak #1: Accidental Globals

```javascript
❌ BAD:
function oops() {
  leak = "I'm global!";  // No let/const/var
}
oops();
// 'leak' is now on global object → NEVER GC'd

✅ GOOD:
function safe() {
  const local = "I'm local!";
}
safe();
// 'local' is GC'd when function returns
```

### Leak #2: Forgotten Timers

```javascript
❌ BAD:
const bigData = new Array(1000000);
setInterval(() => {
  console.log(bigData.length);
}, 1000);
// Timer keeps bigData alive FOREVER!

✅ GOOD:
const bigData = new Array(1000000);
const timer = setInterval(() => {
  console.log(bigData.length);
}, 1000);

// Clean up when done
setTimeout(() => {
  clearInterval(timer);  // ← Now bigData can be GC'd
}, 10000);
```

### Leak #3: Closure Traps

```javascript
❌ BAD:
function createLeak() {
  const bigData = new Array(1000000);
  const smallData = "small";

  return function() {
    return smallData;  // Only needs smallData
  };
}
const fn = createLeak();
// But closure holds entire scope → bigData can't be GC'd!

✅ GOOD:
function createSafe() {
  const bigData = new Array(1000000);
  const smallData = "small";

  // Process bigData here, don't capture it
  const result = bigData.length;

  return function() {
    return smallData + result;  // Only captures needed data
  };
}
```

### Leak #4: Event Listeners

```javascript
❌ BAD:
class Widget {
  constructor() {
    this.bigData = new Array(1000000);
    document.addEventListener('click', () => {
      console.log(this.bigData.length);
    });
  }
}
const w = new Widget();
// Listener holds reference to 'this' → bigData can't be GC'd

✅ GOOD:
class Widget {
  constructor() {
    this.bigData = new Array(1000000);
    this.handler = () => {
      console.log(this.bigData.length);
    };
    document.addEventListener('click', this.handler);
  }

  destroy() {
    document.removeEventListener('click', this.handler);
    this.bigData = null;  // Now can be GC'd
  }
}
```

---

## 📊 Memory Usage Breakdown

```
process.memoryUsage() returns:
{
  rss: 40000000,           // Resident Set Size (40 MB)
  heapTotal: 8000000,      // Heap allocated (8 MB)
  heapUsed: 6000000,       // Heap actually used (6 MB)
  external: 1500000,       // C++ objects (1.5 MB)
  arrayBuffers: 100000     // ArrayBuffers (0.1 MB)
}
```

### Visual Breakdown:

```
┌─────────────────────────────────────────┐
│  RSS (Resident Set Size): 40 MB         │
│  Total memory for Node.js process       │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐  │
│  │ Heap Total: 8 MB                  │  │
│  │ V8 allocated heap space           │  │
│  ├───────────────────────────────────┤  │
│  │ ┌─────────────────────────────┐   │  │
│  │ │ Heap Used: 6 MB             │   │  │
│  │ │ Actually used by objects    │   │  │
│  │ └─────────────────────────────┘   │  │
│  │ Free: 2 MB                        │  │
│  └───────────────────────────────────┘  │
│                                         │
│  External C++ memory: 1.5 MB            │
│  Array Buffers: 0.1 MB                  │
│  Code, stack, etc.: ~30 MB              │
└─────────────────────────────────────────┘
```

---

## ⚙️ V8 Flags Quick Reference

### Memory Configuration

```bash
# Increase old generation size to 4GB
node --max-old-space-size=4096 app.js

# Increase new generation size
node --max-semi-space-size=16 app.js

# Optimize for memory over speed
node --optimize-for-size app.js
```

### Debugging & Profiling

```bash
# Enable manual GC
node --expose-gc app.js
# Then in code: global.gc()

# Trace GC activity
node --trace-gc app.js

# Detailed GC info
node --trace-gc-verbose app.js

# CPU profiling
node --prof app.js
# Analyze with: node --prof-process isolate-*.log

# Memory profiling with Chrome DevTools
node --inspect app.js
# Open chrome://inspect
```

---

## ✅ Best Practices Checklist

### Object Creation

- ✅ Use consistent property order
- ✅ Initialize all properties in constructor
- ✅ Avoid adding properties after creation
- ❌ Never use `delete` on properties
- ❌ Never use different property orders

### Memory Management

- ✅ Clear timers with `clearInterval/clearTimeout`
- ✅ Remove event listeners when done
- ✅ Use WeakMap/WeakSet for caches
- ✅ Nullify large data when finished
- ❌ Avoid closures capturing large data

### Monitoring

- ✅ Monitor `process.memoryUsage()` in production
- ✅ Use heap snapshots to find leaks
- ✅ Profile with Chrome DevTools
- ✅ Set up memory usage alerts

### Performance

- ✅ Use object pooling for frequent allocations
- ✅ Reuse objects instead of creating new ones
- ✅ Batch operations to reduce GC pressure
- ✅ Use typed arrays for numeric data

---

## 🎯 Key Takeaways

1. **Stack vs Heap**: Stack is fast but limited; heap is larger but needs GC
2. **Generational GC**: Young objects die fast; old objects live long
3. **Hidden Classes**: Consistent object shapes = fast property access
4. **Memory Leaks**: Always clean up timers, listeners, and closures
5. **Monitoring**: Use profiling tools to find and fix issues

**Remember**: Understanding V8 internals helps you write faster, more memory-efficient JavaScript! 🚀
