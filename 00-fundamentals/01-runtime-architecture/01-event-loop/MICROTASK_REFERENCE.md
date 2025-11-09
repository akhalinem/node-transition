# Microtask Prioritization - Quick Reference

## 🎯 Core Concept

Node.js has **TWO separate microtask queues** that run at specific checkpoints in the event loop.

---

## 📋 The Two Queues

### 1. **NextTick Queue** ⚡ (Highest Priority)

```javascript
process.nextTick(() => {
  console.log("Runs first!");
});
```

- **Node.js specific** (not in browsers)
- **Highest async priority**
- Runs **before** Promise microtasks
- Can **starve** the event loop if overused

### 2. **Promise Microtask Queue** 🔄

```javascript
Promise.resolve().then(() => {
  console.log("Runs after nextTick");
});

queueMicrotask(() => {
  console.log("Same queue as Promises");
});
```

- **Standard ECMAScript** microtasks
- Includes: `Promise.then/catch/finally`, `queueMicrotask()`, `async/await`
- Runs **after** nextTick queue is empty
- **Cross-platform** (works in browsers)

---

## 🔄 Execution Order

After **EVERY** callback execution:

```
1. Execute callback (timer/I/O/setImmediate)
   ↓
2. Drain ENTIRE nextTick queue ⚡
   (even newly added nextTicks)
   ↓
3. Drain ENTIRE Promise queue 🔄
   (even newly added promises)
   ↓
4. Continue to next callback or phase
```

---

## 🎭 Complete Priority Hierarchy

```
1. Synchronous code (always runs first)
   ↓
2. process.nextTick queue (highest async priority)
   ↓
3. Promise microtask queue
   ↓
4. Event loop phases:
   - Timers (setTimeout/setInterval)
   - I/O callbacks (fs.readFile)
   - setImmediate
   - Close callbacks
```

---

## 💡 Key Examples

### Example 1: Basic Priority

```javascript
Promise.resolve().then(() => console.log("Promise"));
process.nextTick(() => console.log("nextTick"));

// Output:
// nextTick
// Promise
```

### Example 2: Queue Draining

```javascript
process.nextTick(() => {
  console.log("1");
  process.nextTick(() => console.log("2"));
});

Promise.resolve().then(() => console.log("3"));

// Output:
// 1
// 2  ← Added during drain, still runs before Promise
// 3
```

### Example 3: Interleaving

```javascript
process.nextTick(() => {
  console.log("1");
  Promise.resolve().then(() => console.log("2"));
});

Promise.resolve().then(() => {
  console.log("3");
  process.nextTick(() => console.log("4"));
});

// Output:
// 1  ← nextTick runs first
// 3  ← Then Promise
// 4  ← nextTick scheduled in Promise (high priority!)
// 2  ← Promise scheduled in nextTick
```

### Example 4: async/await

```javascript
async function demo() {
  console.log("1"); // Synchronous

  await Promise.resolve();
  console.log("2"); // Promise microtask
}

process.nextTick(() => console.log("3"));
demo();
Promise.resolve().then(() => console.log("4"));

// Output:
// 1  ← Sync
// 3  ← nextTick
// 2  ← await continuation
// 4  ← Promise
```

---

## ⚠️ Danger: Event Loop Starvation

### BAD: Infinite nextTick ❌

```javascript
function recursiveNextTick() {
  process.nextTick(recursiveNextTick);
}

setTimeout(() => console.log("Never runs!"), 0);
recursiveNextTick(); // BLOCKS EVERYTHING!
```

**Result**: ~19 million nextTicks/second, event loop starved!

### GOOD: Use setImmediate ✅

```javascript
function safeRecursive() {
  setImmediate(safeRecursive); // Yields to event loop
}

setTimeout(() => console.log("This runs!"), 0);
safeRecursive(); // Event loop stays responsive
```

**Result**: ~74k iterations/second, event loop responsive!

---

## 🎯 When to Use Each

### Use `process.nextTick()` when:

- ✅ Need to run **before** any I/O
- ✅ Initializing event emitters
- ✅ Deferring until call stack is empty
- ⚠️ **Caution**: Easy to starve event loop!

### Use `Promise` / `queueMicrotask()` when:

- ✅ Standard async operations
- ✅ Cross-platform code (browsers + Node.js)
- ✅ async/await patterns
- ✅ Generally **safer** than nextTick

### Use `setImmediate()` when:

- ✅ Breaking up long-running work
- ✅ Yielding to event loop
- ✅ Processing large datasets
- ✅ Preventing stack overflow

---

## 🔬 Visual Model

```
┌──────────────────────────────────┐
│   Execute Callback               │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│   Microtask Checkpoint           │
├──────────────────────────────────┤
│ WHILE (nextTick queue NOT empty) │
│   Execute ALL nextTicks ⚡       │
│                                  │
│ WHILE (Promise queue NOT empty)  │
│   Execute ALL Promises 🔄        │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│   Next Callback or Phase         │
└──────────────────────────────────┘
```

---

## 📊 Performance Numbers

From the demo:

- **nextTick recursion**: ~19,445,822 iterations/second (blocks event loop)
- **setImmediate recursion**: ~74,352 iterations/second (event loop responsive)

**Ratio**: nextTick is ~261x faster but **dangerous**!

---

## 🎯 Critical Facts

1. **Two separate queues**: nextTick ≠ Promise
2. **nextTick always first**: Higher priority than Promises
3. **Complete draining**: Both queues drain fully at each checkpoint
4. **Recursive draining**: New microtasks added during drain are included
5. **After EVERY callback**: Microtask checkpoint happens frequently
6. **queueMicrotask = Promise**: They share the same queue
7. **async/await = Promise**: Uses Promise microtask queue
8. **Cross-platform**: Promises work in browsers, nextTick doesn't
9. **Starvation risk**: nextTick can block event loop indefinitely
10. **Best practice**: Prefer Promises/setImmediate over nextTick

---

## 🚀 React & Modern Frameworks

React's concurrent features rely on understanding this:

- State updates often use microtasks
- Batching happens in microtask queue
- Understanding priority prevents race conditions
- Critical for optimizing React 18+ applications

---

## 📚 Further Study

- [Node.js Event Loop Docs](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
- [process.nextTick() Guide](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/#process-nexttick)
- [Microtask Spec](https://html.spec.whatwg.org/multipage/webappapis.html#microtask-queue)
- [Jake Archibald's Event Loop Talk](https://www.youtube.com/watch?v=cCOL7MC4Pl0)
