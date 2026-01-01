// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Concurrency Control - Managing Parallel Operations
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("⚙️  Concurrency Control Patterns");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

console.log("Why control concurrency?");
console.log("  • Avoid overwhelming APIs (rate limits)");
console.log("  • Manage memory usage");
console.log("  • Control system load");
console.log("  • Respect resource constraints\n");

// ========================================
// Part 1: The Problem - Uncontrolled Concurrency
// ========================================

console.log("=== 1. The Problem ===\n");

function processItem(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`  Processed item ${id}`);
      resolve(id);
    }, 100);
  });
}

async function demonstrateProblem() {
  console.log("Scenario: Process 20 items\n");

  console.log("❌ BAD: Uncontrolled - All at once!");
  const items = Array.from({ length: 20 }, (_, i) => i + 1);

  console.log("Starting all 20 operations simultaneously...\n");
  const start = Date.now();

  // This creates 20 concurrent operations!
  const results = await Promise.all(items.map((id) => processItem(id)));

  const elapsed = Date.now() - start;
  console.log(`\nCompleted ${results.length} items in ~${elapsed}ms`);
  console.log("⚠️  All 20 ran at once - could overwhelm server!\n");

  setTimeout(demonstrateSolution, 500);
}

demonstrateProblem();

// ========================================
// Part 2: Solution 1 - Batch Processing
// ========================================

function demonstrateSolution() {
  console.log("=== 2. Solution 1: Batch Processing ===\n");

  async function processBatch() {
    const items = Array.from({ length: 20 }, (_, i) => i + 1);
    const batchSize = 5;

    console.log(`✅ GOOD: Process in batches of ${batchSize}\n`);

    const start = Date.now();
    const allResults = [];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      console.log(
        `Batch ${Math.floor(i / batchSize) + 1}: Processing items ${batch[0]}-${
          batch[batch.length - 1]
        }`
      );

      const batchResults = await Promise.all(
        batch.map((id) => processItem(id))
      );

      allResults.push(...batchResults);
      console.log(`  Batch complete (${batchResults.length} items)\n`);
    }

    const elapsed = Date.now() - start;
    console.log(`Total: ${allResults.length} items in ~${elapsed}ms`);
    console.log(`Max concurrency: ${batchSize} at a time\n`);

    setTimeout(demonstrateAdvancedControl, 500);
  }

  processBatch();
}

// ========================================
// Part 3: Solution 2 - Concurrency Limiter
// ========================================

function demonstrateAdvancedControl() {
  console.log("=== 3. Solution 2: Concurrency Limiter ===\n");

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

    // Wait for all remaining
    return Promise.all(results);
  }

  async function demo() {
    const items = Array.from({ length: 15 }, (_, i) => i + 1);
    const limit = 3;

    console.log(
      `Processing ${items.length} items with max ${limit} concurrent\n`
    );

    const start = Date.now();
    const results = await limitConcurrency(items, limit, processItem);
    const elapsed = Date.now() - start;

    console.log(`\nCompleted ${results.length} items in ~${elapsed}ms`);
    console.log(`Never more than ${limit} running at once!\n`);

    setTimeout(demonstrateQueue, 500);
  }

  demo();
}

// ========================================
// Part 4: Solution 3 - Async Queue
// ========================================

function demonstrateQueue() {
  console.log("=== 4. Solution 3: Async Queue ===\n");

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
        this.process(); // Process next
      }
    }

    get size() {
      return this.queue.length;
    }

    get pending() {
      return this.running;
    }
  }

  async function demo() {
    const queue = new AsyncQueue(3); // Max 3 concurrent
    const items = Array.from({ length: 12 }, (_, i) => i + 1);

    console.log("Adding items to queue with concurrency=3\n");

    const start = Date.now();
    const promises = items.map((id) => queue.add(() => processItem(id)));

    const results = await Promise.all(promises);
    const elapsed = Date.now() - start;

    console.log(`\nProcessed ${results.length} items in ~${elapsed}ms`);
    console.log("Queue automatically managed concurrency!\n");

    setTimeout(showRealWorldExamples, 500);
  }

  demo();
}

// ========================================
// Part 5: Real-World Examples
// ========================================

function showRealWorldExamples() {
  console.log("=== 5. Real-World Use Cases ===\n");

  // Use Case 1: API Rate Limiting
  console.log("Use Case 1: API Rate Limiting");
  console.log("─────────────────────────────\n");

  async function fetchWithRateLimit() {
    // Simulate API that allows 5 requests per second
    function callAPI(id) {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log(`  API call ${id} completed`);
          resolve({ id, data: "result" });
        }, 100);
      });
    }

    const urls = Array.from({ length: 20 }, (_, i) => i + 1);
    const rateLimit = 5; // 5 concurrent

    console.log("Calling API with rate limit of 5 concurrent requests\n");

    const results = [];
    for (let i = 0; i < urls.length; i += rateLimit) {
      const batch = urls.slice(i, i + rateLimit);
      const batchResults = await Promise.all(batch.map((id) => callAPI(id)));
      results.push(...batchResults);
    }

    console.log(
      `\nCompleted ${results.length} API calls without exceeding rate limit\n`
    );
  }

  fetchWithRateLimit().then(() => {
    setTimeout(useCase2, 500);
  });
}

function useCase2() {
  console.log("Use Case 2: Database Batch Operations");
  console.log("──────────────────────────────────────\n");

  async function batchInsert() {
    // Simulate database insert
    function insertRecord(record) {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log(`  Inserted record ${record.id}`);
          resolve(record);
        }, 50);
      });
    }

    const records = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      data: `record-${i + 1}`,
    }));

    const batchSize = 10;
    console.log(
      `Inserting ${records.length} records in batches of ${batchSize}\n`
    );

    let inserted = 0;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      await Promise.all(batch.map((record) => insertRecord(record)));
      inserted += batch.length;
      console.log(`  Progress: ${inserted}/${records.length}`);
    }

    console.log(`\n✅ All ${records.length} records inserted\n`);
  }

  batchInsert().then(() => {
    setTimeout(useCase3, 500);
  });
}

function useCase3() {
  console.log("Use Case 3: File Processing");
  console.log("────────────────────────────\n");

  async function processFiles() {
    // Simulate file processing (memory-intensive)
    function processFile(filename) {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log(`  Processed ${filename}`);
          resolve({ filename, processed: true });
        }, 200);
      });
    }

    const files = Array.from({ length: 10 }, (_, i) => `file-${i + 1}.jpg`);
    const maxConcurrent = 3; // Limit to avoid memory issues

    console.log(
      `Processing ${files.length} images, max ${maxConcurrent} at once\n`
    );

    const executing = [];
    const results = [];

    for (const file of files) {
      const promise = processFile(file).then((result) => {
        executing.splice(executing.indexOf(promise), 1);
        return result;
      });

      results.push(promise);
      executing.push(promise);

      if (executing.length >= maxConcurrent) {
        await Promise.race(executing);
      }
    }

    const allResults = await Promise.all(results);
    console.log(
      `\n✅ Processed ${allResults.length} files without exhausting memory\n`
    );
  }

  processFiles().then(() => {
    setTimeout(showPatternComparison, 500);
  });
}

function showPatternComparison() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 Pattern Comparison");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("1. Batch Processing");
  console.log("   Pros: Simple, predictable");
  console.log("   Cons: Waits for entire batch, can be slower");
  console.log("   Use: Simple rate limiting, bulk operations\n");

  console.log("2. Concurrency Limiter");
  console.log("   Pros: Efficient, maintains constant concurrency");
  console.log("   Cons: More complex implementation");
  console.log("   Use: Maximum throughput with limits\n");

  console.log("3. Async Queue");
  console.log("   Pros: Very flexible, priority support possible");
  console.log("   Cons: Most complex, overhead");
  console.log("   Use: Complex workflows, job processing\n");

  setTimeout(showBestPractices, 100);
}

function showBestPractices() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("💡 Best Practices");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("✅ Always limit concurrency for:");
  console.log("   • External API calls");
  console.log("   • Database operations");
  console.log("   • File I/O operations");
  console.log("   • Memory-intensive tasks\n");

  console.log("✅ Choose limits based on:");
  console.log("   • API rate limits");
  console.log("   • Available memory");
  console.log("   • Server capacity");
  console.log("   • Network bandwidth\n");

  console.log("✅ Monitor and adjust:");
  console.log("   • Track success/failure rates");
  console.log("   • Measure actual throughput");
  console.log("   • Watch resource usage");
  console.log("   • Tune for your specific use case\n");

  console.log("⚠️  Common mistakes:");
  console.log("   • Setting concurrency too high (overwhelm)");
  console.log("   • Setting it too low (slow performance)");
  console.log("   • Not handling errors in parallel operations");
  console.log("   • Forgetting to limit in production\n");

  setTimeout(showSummary, 100);
}

function showSummary() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📝 Key Takeaways");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("✅ Uncontrolled concurrency can overwhelm systems");
  console.log("✅ Batch processing is simplest solution");
  console.log("✅ Concurrency limiters maintain constant parallelism");
  console.log("✅ Async queues provide most flexibility");
  console.log("✅ Always limit external API calls");
  console.log("✅ Consider memory and CPU when setting limits");
  console.log("✅ Use libraries like p-limit for production");
  console.log("✅ Monitor and adjust limits based on metrics\n");

  console.log("🎯 Concurrency control is essential for production systems!");
  console.log("   Balance speed with resource constraints.\n");

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("Next: Run 06-retry-patterns.js to learn error recovery!\n");
}
