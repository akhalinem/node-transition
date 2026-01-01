# Async Patterns Cheat Sheet

Quick reference for asynchronous programming in Node.js.

---

## Callbacks

### Error-First Convention

```javascript
function doAsync(input, callback) {
  // callback signature: (error, result)
  if (error) {
    callback(new Error("Something failed"), null);
  } else {
    callback(null, result);
  }
}

// Usage
doAsync(data, (err, result) => {
  if (err) {
    console.error("Error:", err);
    return;
  }
  console.log("Success:", result);
});
```

### Promisify Callbacks

```javascript
const { promisify } = require("util");
const fs = require("fs");

// Convert callback to Promise
const readFileAsync = promisify(fs.readFile);

// Use with async/await
const content = await readFileAsync("file.txt", "utf8");
```

### Manual Promisification

```javascript
function promisify(fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      fn(...args, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  };
}
```

---

## Promises

### Creating Promises

```javascript
// Basic Promise
const promise = new Promise((resolve, reject) => {
  if (success) {
    resolve(value);
  } else {
    reject(new Error("Failed"));
  }
});

// Immediately resolved
const resolved = Promise.resolve(value);

// Immediately rejected
const rejected = Promise.reject(new Error("Failed"));
```

### Consuming Promises

```javascript
promise
  .then((result) => {
    // Handle success
    return nextValue; // Can return value or Promise
  })
  .then((nextResult) => {
    // Chain continues
  })
  .catch((error) => {
    // Handle any error in the chain
  })
  .finally(() => {
    // Always runs, cleanup code
  });
```

### Promise States

```javascript
// Pending → neither fulfilled nor rejected
// Fulfilled → operation completed successfully
// Rejected → operation failed

const promise = new Promise((resolve, reject) => {
  // Initially PENDING
  setTimeout(() => resolve("done"), 1000); // → FULFILLED
  // Or: setTimeout(() => reject(err), 1000); // → REJECTED
});
```

---

## Async/Await

### Basic Syntax

```javascript
// Declare async function
async function fetchData() {
  // Can use await inside
  const result = await someAsyncOperation();
  return result; // Automatically wrapped in Promise
}

// async functions always return a Promise
fetchData().then((result) => console.log(result));
```

### Error Handling

```javascript
async function safeFetch() {
  try {
    const result = await riskyOperation();
    return result;
  } catch (error) {
    console.error("Error:", error);
    throw error; // Re-throw or handle
  } finally {
    // Cleanup code
  }
}
```

### Top-Level Await (ESM Only)

```javascript
// In .mjs files or with "type": "module"
const data = await fetch("https://api.example.com");
const json = await data.json();
console.log(json);
```

### IIFE Pattern (CommonJS)

```javascript
// Can't use top-level await in CommonJS
(async () => {
  const result = await doSomething();
  console.log(result);
})();
```

---

## Promise Combinators

### Promise.all()

**Use when:** Need all results, fail fast on any error

```javascript
const promises = [fetch(url1), fetch(url2), fetch(url3)];

// Waits for all, rejects if any fails
const results = await Promise.all(promises);
// results = [result1, result2, result3]

// Error handling
try {
  const results = await Promise.all(promises);
} catch (error) {
  // If ANY promise fails, catch fires
  // You lose all successful results!
}
```

### Promise.allSettled()

**Use when:** Need all results, regardless of success/failure

```javascript
const promises = [fetch(url1), fetch(url2), fetch(url3)];

// Waits for all, never rejects
const results = await Promise.allSettled(promises);

// results = [
//   { status: 'fulfilled', value: result1 },
//   { status: 'rejected', reason: error2 },
//   { status: 'fulfilled', value: result3 }
// ]

results.forEach((result) => {
  if (result.status === "fulfilled") {
    console.log("Success:", result.value);
  } else {
    console.error("Failed:", result.reason);
  }
});
```

### Promise.race()

**Use when:** Need first to complete (success or failure)

```javascript
// First to settle wins
const result = await Promise.race([
  fetch("https://api1.com"),
  fetch("https://api2.com"),
]);

// Use for timeouts
const timeout = new Promise((_, reject) =>
  setTimeout(() => reject(new Error("Timeout")), 5000)
);

const result = await Promise.race([fetch(url), timeout]);
```

### Promise.any()

**Use when:** Need first successful result

```javascript
// First to fulfill wins, rejects only if ALL fail
const result = await Promise.any([
  fetch("https://api1.com"),
  fetch("https://api2.com"),
  fetch("https://api3.com"),
]);

// If all fail
try {
  const result = await Promise.any(promises);
} catch (error) {
  // AggregateError with all rejection reasons
  console.error(error.errors);
}
```

### Combinator Comparison

| Method         | Resolves When  | Rejects When  | Result Type      |
| -------------- | -------------- | ------------- | ---------------- |
| `all()`        | All fulfill    | Any rejects   | Array of values  |
| `allSettled()` | All settle     | Never         | Array of results |
| `race()`       | First settles  | First rejects | Single value     |
| `any()`        | First fulfills | All reject    | Single value     |

---

## Sequential vs Parallel Execution

### Sequential (One After Another)

```javascript
// ❌ SLOW - runs one at a time
async function sequential() {
  const result1 = await operation1(); // Wait
  const result2 = await operation2(); // Wait
  const result3 = await operation3(); // Wait
  return [result1, result2, result3];
}
// Total time: time1 + time2 + time3
```

### Parallel (All at Once)

```javascript
// ✅ FAST - runs simultaneously
async function parallel() {
  const [result1, result2, result3] = await Promise.all([
    operation1(),
    operation2(),
    operation3(),
  ]);
  return [result1, result2, result3];
}
// Total time: max(time1, time2, time3)
```

### Dependent Sequential

```javascript
// When you NEED sequential (depends on previous result)
async function dependent() {
  const user = await getUser(id);
  const posts = await getPosts(user.id); // Needs user.id
  const comments = await getComments(posts[0].id); // Needs post.id
  return { user, posts, comments };
}
```

---

## Concurrency Control

### Basic Batch Processing

```javascript
async function processBatch(items, batchSize) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((item) => process(item)));
    results.push(...batchResults);
  }
  return results;
}

// Usage
await processBatch(urls, 5); // 5 concurrent at a time
```

### Concurrency Limiter Pattern

```javascript
async function limitConcurrency(items, limit, processFn) {
  const results = [];
  const executing = [];

  for (const item of items) {
    const promise = processFn(item).then((result) => {
      // Remove from executing when done
      executing.splice(executing.indexOf(promise), 1);
      return result;
    });

    results.push(promise);
    executing.push(promise);

    if (executing.length >= limit) {
      // Wait for at least one to complete
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
}

// Usage
await limitConcurrency(items, 10, async (item) => {
  return await processItem(item);
});
```

### Using p-limit Library

```javascript
const pLimit = require("p-limit");

const limit = pLimit(5); // Max 5 concurrent

const promises = urls.map(
  (url) => limit(() => fetch(url)) // Wrapped in limiter
);

const results = await Promise.all(promises);
```

---

## Retry Patterns

### Basic Retry

```javascript
async function retry(fn, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      console.log(`Attempt ${attempt} failed, retrying...`);
    }
  }
}

// Usage
const result = await retry(() => fetch(url), 5);
```

### Retry with Delay

```javascript
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retryWithDelay(fn, maxAttempts = 3, delayMs = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      await delay(delayMs);
    }
  }
}
```

### Exponential Backoff

```javascript
async function retryWithBackoff(
  fn,
  maxAttempts = 5,
  baseDelay = 1000,
  maxDelay = 30000
) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;

      // Exponential backoff: 1s, 2s, 4s, 8s, 16s...
      const delayMs = Math.min(baseDelay * 2 ** (attempt - 1), maxDelay);

      // Add jitter (randomness) to avoid thundering herd
      const jitter = Math.random() * 1000;

      console.log(`Retry ${attempt}/${maxAttempts} in ${delayMs + jitter}ms`);
      await delay(delayMs + jitter);
    }
  }
}
```

---

## Timeout Patterns

### Basic Timeout

```javascript
function timeout(ms) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Timeout")), ms)
  );
}

async function fetchWithTimeout(url, ms = 5000) {
  return Promise.race([fetch(url), timeout(ms)]);
}

// Usage
try {
  const result = await fetchWithTimeout(url, 3000);
} catch (error) {
  if (error.message === "Timeout") {
    console.error("Request timed out");
  }
}
```

### AbortController (Modern)

```javascript
async function fetchWithAbort(url, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timeout");
    }
    throw error;
  }
}
```

---

## Async Iteration

### for-await-of Loop

```javascript
// Iterate over async iterable
async function* generateNumbers() {
  for (let i = 0; i < 5; i++) {
    await delay(100);
    yield i;
  }
}

for await (const num of generateNumbers()) {
  console.log(num); // 0, 1, 2, 3, 4 (with delays)
}
```

### Process Stream Asynchronously

```javascript
const fs = require("fs");
const readline = require("readline");

async function processLargeFile(filename) {
  const stream = fs.createReadStream(filename);
  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    await processLine(line);
  }
}
```

### Async Generator

```javascript
async function* fetchPages(url, maxPages) {
  for (let page = 1; page <= maxPages; page++) {
    const response = await fetch(`${url}?page=${page}`);
    const data = await response.json();
    yield data;
  }
}

// Consume
for await (const page of fetchPages("/api/items", 10)) {
  console.log("Processing page:", page);
}
```

---

## Error Handling Patterns

### Try-Catch Wrapper

```javascript
async function safeAsync(fn, fallback) {
  try {
    return await fn();
  } catch (error) {
    console.error("Error:", error);
    return fallback;
  }
}

// Usage
const data = await safeAsync(() => fetchData(), null);
```

### Error Aggregation

```javascript
async function runAll(tasks) {
  const results = await Promise.allSettled(tasks);
  const errors = results
    .filter((r) => r.status === "rejected")
    .map((r) => r.reason);

  if (errors.length > 0) {
    console.error(`${errors.length} tasks failed:`, errors);
  }

  return results.filter((r) => r.status === "fulfilled").map((r) => r.value);
}
```

### Custom Error Classes

```javascript
class TimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = "TimeoutError";
  }
}

class RetryError extends Error {
  constructor(message, attempts) {
    super(message);
    this.name = "RetryError";
    this.attempts = attempts;
  }
}

// Usage
try {
  await operationWithTimeout();
} catch (error) {
  if (error instanceof TimeoutError) {
    // Handle timeout
  } else if (error instanceof RetryError) {
    // Handle retry failure
  }
}
```

---

## Real-World Patterns

### Queue with Concurrency

```javascript
class AsyncQueue {
  constructor(concurrency = 1) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  async add(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }

    this.running++;
    const { fn, resolve, reject } = this.queue.shift();

    try {
      const result = await fn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process();
    }
  }
}

// Usage
const queue = new AsyncQueue(5);
const results = await Promise.all(
  urls.map((url) => queue.add(() => fetch(url)))
);
```

### Debounced Async Function

```javascript
function debounceAsync(fn, delay) {
  let timeoutId;
  let latestResolve;
  let latestReject;

  return function (...args) {
    clearTimeout(timeoutId);

    return new Promise((resolve, reject) => {
      latestResolve = resolve;
      latestReject = reject;

      timeoutId = setTimeout(async () => {
        try {
          const result = await fn(...args);
          latestResolve(result);
        } catch (error) {
          latestReject(error);
        }
      }, delay);
    });
  };
}

// Usage
const debouncedSearch = debounceAsync(searchAPI, 300);
await debouncedSearch(query);
```

### Throttled Async Function

```javascript
function throttleAsync(fn, limit) {
  let inThrottle;

  return async function (...args) {
    if (!inThrottle) {
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
      return fn(...args);
    }
  };
}
```

---

## Common Mistakes

### ❌ Floating Promises

```javascript
// ❌ WRONG - promise not awaited
async function bad() {
  doAsync(); // Floats! Errors not caught
  console.log("done");
}

// ✅ CORRECT
async function good() {
  await doAsync();
  console.log("done");
}
```

### ❌ Sequential Instead of Parallel

```javascript
// ❌ SLOW
async function slow() {
  const a = await fetch(url1); // 1 sec
  const b = await fetch(url2); // 1 sec
  const c = await fetch(url3); // 1 sec
  // Total: 3 seconds
}

// ✅ FAST
async function fast() {
  const [a, b, c] = await Promise.all([fetch(url1), fetch(url2), fetch(url3)]);
  // Total: 1 second
}
```

### ❌ forEach with async

```javascript
// ❌ WRONG - doesn't wait!
async function bad() {
  items.forEach(async (item) => {
    await processItem(item);
  });
  console.log("done"); // Logs immediately!
}

// ✅ CORRECT
async function good() {
  for (const item of items) {
    await processItem(item);
  }
  console.log("done"); // Waits for all
}

// ✅ PARALLEL VERSION
async function goodParallel() {
  await Promise.all(items.map((item) => processItem(item)));
  console.log("done");
}
```

### ❌ Not Handling Rejections

```javascript
// ❌ WRONG
new Promise((resolve, reject) => {
  reject(new Error("Failed"));
}); // Unhandled rejection!

// ✅ CORRECT
new Promise((resolve, reject) => {
  reject(new Error("Failed"));
}).catch((err) => console.error(err));
```

---

## Quick Reference

### When to Use What

| Pattern            | Use Case                         |
| ------------------ | -------------------------------- |
| Callbacks          | Legacy code, low-level APIs      |
| Promises           | Simple async operations          |
| async/await        | Modern async code (preferred!)   |
| Promise.all        | Wait for all, fail fast          |
| Promise.allSettled | Get all results, handle each     |
| Promise.race       | First to complete, timeouts      |
| Promise.any        | First success, fallback servers  |
| for-await-of       | Async iteration, streams         |
| Concurrency limit  | Control load, avoid overwhelming |
| Retry with backoff | Network requests, flaky services |

---

## Debugging Tips

```javascript
// Add logging to track async flow
async function debug() {
  console.log("1. Starting");
  const result = await doAsync();
  console.log("2. Got result:", result);
  return result;
}

// Track unhandled rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
});

// Use Promise.allSettled to see all results
const results = await Promise.allSettled(promises);
console.table(results);
```

---

**🎯 Master these patterns and async programming becomes second nature!**
