// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Exercise 3: Build a Concurrency Limiter
// Difficulty: ⭐⭐⭐⭐
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("🎯 Exercise 3: Concurrency Limiter");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

console.log("Goal: Build a function that limits concurrent async operations");
console.log(
  "Skills: Advanced Promise patterns, queuing, resource management\n"
);

// Simulate async task
function createTask(id, duration) {
  return () =>
    new Promise((resolve) => {
      console.log(`  Task ${id} started`);
      setTimeout(() => {
        console.log(`  Task ${id} completed (took ${duration}ms)`);
        resolve({ id, duration, result: `Result ${id}` });
      }, duration);
    });
}

// ========================================
// Task 1: Basic Concurrency Limiter
// ========================================

console.log("=== Task 1: Basic Limiter ===\n");

console.log("Build limitConcurrency(tasks, limit)");
console.log("  - tasks: array of async functions");
console.log("  - limit: max concurrent executions");
console.log("  - Returns: Promise that resolves with all results\n");

// TODO: Implement concurrency limiter
async function limitConcurrency(tasks, limit) {
  const results = [];
  const executing = [];

  for (const task of tasks) {
    const p = task().then((result) => {
      executing.splice(executing.indexOf(p), 1);
      return result;
    });

    results.push(p);
    executing.push(p);

    if (executing.length >= limit) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
}

// Uncomment to test:

console.log("Testing with 10 tasks, limit=3\n");

const tasks = Array.from({ length: 10 }, (_, i) =>
  createTask(i + 1, Math.random() * 500 + 500)
);

const start = Date.now();
limitConcurrency(tasks, 3).then((results) => {
  const elapsed = Date.now() - start;
  console.log(`\n✅ All ${results.length} tasks completed in ${elapsed}ms`);
  console.log("Check above: never more than 3 running at once!\n");
});

console.log("👉 Complete limitConcurrency() and test it\n");

// ========================================
// Task 2: Concurrency Limiter with Error Handling
// ========================================

console.log("=== Task 2: Handle Errors ===\n");

function createFailingTask(id, shouldFail) {
  return () =>
    new Promise((resolve, reject) => {
      console.log(`  Task ${id} started`);
      setTimeout(() => {
        if (shouldFail) {
          console.log(`  Task ${id} failed!`);
          reject(new Error(`Task ${id} failed`));
        } else {
          console.log(`  Task ${id} completed`);
          resolve({ id, result: `Result ${id}` });
        }
      }, 200);
    });
}

// TODO: Enhance limiter to handle errors
async function limitConcurrencyWithErrors(tasks, limit) {
  // YOUR CODE HERE
  // Should not stop on first error
  // Return { successful: [], failed: [] }
}

// Uncomment to test:
/*
console.log('Testing with some failures...\n');

const mixedTasks = [
  createFailingTask(1, false),
  createFailingTask(2, true),  // Fails
  createFailingTask(3, false),
  createFailingTask(4, true),  // Fails
  createFailingTask(5, false),
  createFailingTask(6, false)
];

limitConcurrencyWithErrors(mixedTasks, 2)
  .then(results => {
    console.log(`\n✅ Successful: ${results.successful.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    console.log('');
  });
*/

console.log("👉 Complete limitConcurrencyWithErrors() and test it\n");

// ========================================
// Task 3: Build AsyncQueue Class
// ========================================

console.log("=== Task 3: AsyncQueue Class ===\n");

console.log("Build a reusable AsyncQueue class:");
console.log("  - constructor(concurrency)");
console.log("  - add(fn) - returns Promise");
console.log("  - size - get queue size");
console.log("  - pending - get currently running count\n");

// TODO: Implement AsyncQueue
class AsyncQueue {
  constructor(concurrency = 1) {
    // YOUR CODE HERE
  }

  async add(fn) {
    // YOUR CODE HERE
    // Add function to queue
    // Return promise that resolves with function result
  }

  async process() {
    // YOUR CODE HERE
    // Process items from queue
  }

  get size() {
    // YOUR CODE HERE
    // Return queue length
  }

  get pending() {
    // YOUR CODE HERE
    // Return number of running tasks
  }
}

// Uncomment to test:
/*
console.log('Testing AsyncQueue...\n');

const queue = new AsyncQueue(2); // Max 2 concurrent

const queueTasks = Array.from({ length: 8 }, (_, i) =>
  createTask(i + 1, 300)
);

console.log('Adding 8 tasks to queue (concurrency=2)...\n');

Promise.all(queueTasks.map(task => queue.add(task)))
  .then(results => {
    console.log(`\n✅ Queue processed all ${results.length} tasks`);
    console.log('');
  });
*/

console.log("👉 Complete AsyncQueue class and test it\n");

// ========================================
// Task 4: Priority Queue
// ========================================

console.log("=== Task 4: Priority Queue ===\n");

console.log("Enhance AsyncQueue to support priorities:");
console.log("  - add(fn, priority) - higher priority = earlier execution");
console.log("  - High priority tasks jump ahead in queue\n");

// TODO: Implement PriorityQueue
class PriorityQueue extends AsyncQueue {
  constructor(concurrency = 1) {
    super(concurrency);
    // YOUR CODE HERE
  }

  async add(fn, priority = 0) {
    // YOUR CODE HERE
    // Higher priority should be processed first
  }
}

// Uncomment to test:
/*
console.log('Testing PriorityQueue...\n');

const pQueue = new PriorityQueue(1); // Sequential for demo

// Add tasks with different priorities
console.log('Adding tasks: Low(1), Low(2), High(3), Low(4), High(5)\n');

pQueue.add(createTask(1, 200), 1); // Low
pQueue.add(createTask(2, 200), 1); // Low
pQueue.add(createTask(3, 200), 10); // High - should jump ahead
pQueue.add(createTask(4, 200), 1); // Low
pQueue.add(createTask(5, 200), 10); // High - should jump ahead

// After first completes, order should be: 3, 5, 2, 4
setTimeout(() => {
  console.log('\nExpected order: 1, 3, 5, 2, 4');
  console.log('(Task 1 started first, then high priority 3 & 5)\n');
}, 1500);
*/

console.log("👉 Complete PriorityQueue and test it\n");

// ========================================
// Task 5: Rate Limiter
// ========================================

console.log("=== Task 5: Rate Limiter ===\n");

console.log("Build a rate limiter:");
console.log("  - Allows N operations per time window");
console.log("  - Example: 5 requests per second");
console.log("  - Delays operations to stay within limit\n");

// TODO: Implement rate limiter
class RateLimiter {
  constructor(maxOps, windowMs) {
    // maxOps: maximum operations per window
    // windowMs: time window in milliseconds
    // YOUR CODE HERE
  }

  async execute(fn) {
    // YOUR CODE HERE
    // Wait if necessary to stay within rate limit
    // Then execute function
  }
}

// Uncomment to test:
/*
console.log('Testing RateLimiter (5 ops per second)...\n');

const limiter = new RateLimiter(5, 1000); // 5 per second

const rateTasks = Array.from({ length: 12 }, (_, i) =>
  () => {
    console.log(`  Operation ${i + 1} at ${Date.now()}`);
    return Promise.resolve(i + 1);
  }
);

console.log('Executing 12 operations (should take ~2+ seconds)...\n');

const start = Date.now();
Promise.all(rateTasks.map(task => limiter.execute(task)))
  .then(results => {
    const elapsed = Date.now() - start;
    console.log(`\n✅ Completed ${results.length} operations in ${elapsed}ms`);
    console.log('Should be >= 2000ms (rate limited)\n');
  });
*/

console.log("👉 Complete RateLimiter and test it\n");

// ========================================
// Bonus: Adaptive Concurrency
// ========================================

console.log("=== 🏆 Bonus: Adaptive Concurrency ===\n");

console.log("Build an adaptive queue that:");
console.log("  - Starts with initial concurrency");
console.log("  - Increases on success (up to max)");
console.log("  - Decreases on errors (down to min)");
console.log("  - Self-adjusts based on system health\n");

class AdaptiveQueue {
  constructor(initialConcurrency = 5, minConcurrency = 1, maxConcurrency = 20) {
    // YOUR CODE HERE
  }

  async add(fn) {
    // YOUR CODE HERE
    // Adjust concurrency based on success/failure rate
  }

  adjustConcurrency(success) {
    // YOUR CODE HERE
    // Increase on success, decrease on failure
  }
}

console.log("👉 Try building AdaptiveQueue for advanced practice!\n");

// ========================================
// Solution Hints
// ========================================

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("💡 Hints");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

console.log("Task 1 Hint:");
console.log(`
async function limitConcurrency(tasks, limit) {
  const results = [];
  const executing = [];
  
  for (const task of tasks) {
    const promise = task().then(result => {
      executing.splice(executing.indexOf(promise), 1);
      return result;
    });
    
    results.push(promise);
    executing.push(promise);
    
    if (executing.length >= limit) {
      await Promise.race(executing);
    }
  }
  
  return Promise.all(results);
}
`);

console.log("Task 3 Hint:");
console.log(`
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
`);

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

console.log("📚 Learning Objectives:");
console.log("   ✅ Understand concurrency control");
console.log("   ✅ Build reusable async utilities");
console.log("   ✅ Handle errors in concurrent operations");
console.log("   ✅ Implement priority queues");
console.log("   ✅ Build rate limiters\n");

console.log("🎯 These patterns are used in production systems!");
console.log("   Libraries like p-limit, p-queue use similar techniques.\n");

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
