# Async Patterns - Mastering Asynchronous JavaScript

**Time Required**: 3-4 hours  
**Difficulty**: ⭐⭐⭐⭐  
**Importance**: 🔥🔥🔥 ESSENTIAL

---

## 🎯 Learning Objectives

By the end of this module, you'll understand:

- The evolution from callbacks to Promises to async/await
- How to handle errors properly in each async pattern
- When to use Promise.all, race, allSettled, and any
- How to control concurrency in async operations
- Parallel vs sequential execution patterns
- How to avoid common async pitfalls (callback hell, unhandled rejections)
- Async iteration with for-await-of
- Building retry logic and timeout patterns

---

## 📚 Topics Covered

### 1. Callbacks - The Foundation

- Error-first callback pattern
- Callback hell (pyramid of doom)
- Managing callback-based APIs
- Converting callbacks to Promises

### 2. Promises - Better Async Control

- Promise states (pending, fulfilled, rejected)
- Creating and consuming Promises
- Promise chaining
- Error handling with .catch()
- Promise.resolve() and Promise.reject()

### 3. Async/Await - Synchronous-Looking Async Code

- async function declaration
- await keyword behavior
- Error handling with try-catch
- Top-level await (in ESM)
- Async function return values

### 4. Promise Combinators

- Promise.all() - Wait for all, fail fast
- Promise.race() - First to finish wins
- Promise.allSettled() - Wait for all, never reject
- Promise.any() - First to fulfill wins
- When to use each combinator

### 5. Concurrency Control

- Sequential execution patterns
- Parallel execution patterns
- Limiting concurrency (p-limit pattern)
- Batching operations
- Queue-based processing

### 6. Advanced Patterns

- Retry logic with exponential backoff
- Timeout patterns
- Async iteration (for-await-of)
- Async generators
- Error aggregation

---

## 🛠️ Practice

### Examples

Check the `examples/` folder for:

1. **01-callbacks-basics.js** - Error-first callbacks and callback hell
2. **02-promises-fundamentals.js** - Creating and chaining Promises
3. **03-async-await.js** - Modern async/await patterns
4. **04-promise-combinators.js** - All, race, allSettled, any
5. **05-concurrency-control.js** - Sequential vs parallel execution
6. **06-retry-patterns.js** - Retry with exponential backoff
7. **07-async-iteration.js** - for-await-of and async generators
8. **08-real-world-patterns.js** - Practical async patterns

### Exercises

Complete the exercises in `exercises/` folder:

1. **exercise-1-callback-to-promise.js** (⭐⭐) - Convert callback-based code to Promises
2. **exercise-2-parallel-requests.js** (⭐⭐⭐) - Fetch multiple URLs efficiently
3. **exercise-3-concurrency-limiter.js** (⭐⭐⭐⭐) - Build a concurrency control function
4. **exercise-4-retry-with-backoff.js** (⭐⭐⭐) - Implement retry logic
5. **exercise-5-async-queue.js** (⭐⭐⭐⭐) - Build an async job queue

---

## ✅ Self-Check

Before moving on, can you answer:

- [ ] What's the error-first callback convention?
- [ ] How do you handle errors in Promises vs async/await?
- [ ] What's the difference between Promise.all() and Promise.allSettled()?
- [ ] When would you use Promise.race()?
- [ ] How do you run async operations sequentially vs in parallel?
- [ ] How do you limit concurrency to N operations at a time?
- [ ] What happens if you don't await an async function?
- [ ] How do you handle errors in Promise.all()?

---

## 📖 Resources

### Within This Repo

- Each example file has detailed comments explaining the patterns
- Exercises build on each other in complexity
- Solutions provided (try first before peeking!)

### External Resources

- [MDN: Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [MDN: async/await](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await)
- [JavaScript.info: Promises](https://javascript.info/promise-basics)
- [Node.js Design Patterns Book](https://www.nodejsdesignpatterns.com/) - Chapter on async patterns

---

## 🚀 Getting Started

### Step 1: Run the Examples (2 hours)

```bash
# Navigate to examples folder
cd examples/

# Start with callbacks (understand the pain)
node 01-callbacks-basics.js

# Move to Promises (the solution)
node 02-promises-fundamentals.js

# Modern async/await
node 03-async-await.js

# Learn the combinators
node 04-promise-combinators.js

# Master concurrency control
node 05-concurrency-control.js

# Advanced patterns
node 06-retry-patterns.js
node 07-async-iteration.js
node 08-real-world-patterns.js
```

### Step 2: Complete the Exercises (1.5-2 hours)

```bash
cd exercises/

# Exercise 1: Convert callbacks to Promises (⭐⭐)
node exercise-1-callback-to-promise.js

# Exercise 2: Parallel API requests (⭐⭐⭐)
node exercise-2-parallel-requests.js

# Exercise 3: Concurrency limiter (⭐⭐⭐⭐)
node exercise-3-concurrency-limiter.js

# Exercise 4: Retry with backoff (⭐⭐⭐)
node exercise-4-retry-with-backoff.js

# Exercise 5: Async queue (⭐⭐⭐⭐)
node exercise-5-async-queue.js
```

---

## 🎓 Learning Path

### Phase 1: Understand the Evolution (45 min)

Start with callbacks to understand why Promises and async/await exist. Feel the pain of callback hell, then appreciate the solutions.

### Phase 2: Master Promises (45 min)

Learn Promise creation, chaining, and error handling. Understand how Promises work under the hood.

### Phase 3: Embrace Async/Await (30 min)

See how async/await makes async code look synchronous. Practice error handling with try-catch.

### Phase 4: Learn the Tools (45 min)

Master Promise.all(), race(), allSettled(), and any(). Know when to use each.

### Phase 5: Control Concurrency (45 min)

Understand sequential vs parallel execution. Learn to limit concurrent operations.

### Phase 6: Advanced Patterns (45 min)

Build retry logic, timeouts, and async iteration patterns.

---

## 💡 Key Concepts Explained

### The Event Loop Connection

Remember the event loop? Async patterns work because:

- Callbacks go in the callback queue
- Promises use the microtask queue (higher priority!)
- async/await is syntactic sugar over Promises
- Understanding the event loop helps debug async issues

### Error Propagation

```javascript
// Callbacks: Manual error passing
callback(error, null);

// Promises: Automatic propagation
.then().then().catch(err => {})

// Async/await: try-catch blocks
try { await fn(); } catch (err) {}
```

### Microtasks vs Macrotasks

```javascript
// Microtask (runs first)
Promise.resolve().then(() => console.log("microtask"));

// Macrotask (runs later)
setTimeout(() => console.log("macrotask"), 0);

// Output: microtask, macrotask
```

---

## 🎯 Common Pitfalls & Solutions

### ❌ Pitfall 1: Forgetting to await

```javascript
// ❌ WRONG - doesn't wait!
async function bad() {
  doAsync(); // Forgot await!
  console.log("Done"); // Logs before async completes
}

// ✅ CORRECT
async function good() {
  await doAsync();
  console.log("Done"); // Waits for completion
}
```

### ❌ Pitfall 2: Serial when you want parallel

```javascript
// ❌ SLOW - runs sequentially (1 sec each = 3 sec total)
async function slow() {
  const a = await fetch(url1); // Wait
  const b = await fetch(url2); // Wait
  const c = await fetch(url3); // Wait
}

// ✅ FAST - runs in parallel (1 sec total)
async function fast() {
  const [a, b, c] = await Promise.all([fetch(url1), fetch(url2), fetch(url3)]);
}
```

### ❌ Pitfall 3: Not handling Promise.all() rejection

```javascript
// ❌ WRONG - one failure kills all
try {
  await Promise.all(promises);
} catch (err) {
  // Lost all successful results!
}

// ✅ BETTER - get all results, handle failures individually
const results = await Promise.allSettled(promises);
results.forEach((result) => {
  if (result.status === "fulfilled") {
    console.log(result.value);
  } else {
    console.error(result.reason);
  }
});
```

### ❌ Pitfall 4: Unhandled Promise rejections

```javascript
// ❌ WRONG - unhandled rejection!
async function getData() {
  throw new Error("Failed");
}
getData(); // No await, no catch!

// ✅ CORRECT - always handle
getData().catch((err) => console.error(err));

// Or
try {
  await getData();
} catch (err) {
  console.error(err);
}
```

---

## 📊 Quick Decision Guide

### Sequential vs Parallel?

**Use Sequential when:**

- Operations depend on previous results
- Need to limit load on external service
- Order matters

**Use Parallel when:**

- Operations are independent
- Want maximum speed
- Can handle multiple concurrent requests

### Which Promise Combinator?

| Combinator               | Use When                    | Behavior                   |
| ------------------------ | --------------------------- | -------------------------- |
| **Promise.all()**        | Need all results, fail fast | Rejects if any fails       |
| **Promise.allSettled()** | Need all results, always    | Never rejects              |
| **Promise.race()**       | Need first to complete      | Settles when first settles |
| **Promise.any()**        | Need first success          | Rejects only if all fail   |

---

## 🔥 Performance Tips

### 1. Batch API Calls

```javascript
// Instead of 1000 individual requests
for (const id of ids) {
  await fetch(`/api/item/${id}`); // SLOW
}

// Batch them
const batchSize = 50;
for (let i = 0; i < ids.length; i += batchSize) {
  const batch = ids.slice(i, i + batchSize);
  await Promise.all(batch.map((id) => fetch(`/api/item/${id}`)));
}
```

### 2. Use Concurrency Limits

```javascript
// Don't overwhelm the server
async function processWithLimit(items, limit) {
  const results = [];
  for (let i = 0; i < items.length; i += limit) {
    const batch = items.slice(i, i + limit);
    const batchResults = await Promise.all(
      batch.map((item) => processItem(item))
    );
    results.push(...batchResults);
  }
  return results;
}
```

### 3. Cache Promise Results

```javascript
const cache = new Map();

async function fetchWithCache(url) {
  if (cache.has(url)) {
    return cache.get(url);
  }
  const promise = fetch(url).then((r) => r.json());
  cache.set(url, promise); // Cache the promise!
  return promise;
}
```

---

## 🎯 After Completion

You should be able to:

- ✅ Write clean async code without callback hell
- ✅ Handle errors properly in all async patterns
- ✅ Choose the right Promise combinator
- ✅ Control concurrency in async operations
- ✅ Build retry logic and timeout patterns
- ✅ Debug async issues effectively

**Async patterns are the heart of Node.js. Master them and everything else becomes easier!**

---

**Ready to begin?** Start with `examples/01-callbacks-basics.js`!

_Remember: The struggle with async code is normal. Every Node.js developer has been there. Keep practicing!_ Mastery
**Time**: 3-4h | **Difficulty**: ⭐⭐⭐⭐ | **Importance**: 🔥🔥🔥 | 📝 Materials coming soon
**Topics**: Promises | async/await | Concurrency control | Promise methods
**Resources**: [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
