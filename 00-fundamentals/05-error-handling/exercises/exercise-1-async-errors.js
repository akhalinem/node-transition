/**
 * EXERCISE 1: Async Error Handling
 * Difficulty: ⭐⭐
 *
 * Practice handling errors in complex async scenarios including:
 * - Multiple async operations
 * - Parallel requests
 * - Error recovery
 * - Timeouts
 */

const fs = require("fs").promises;
const path = require("path");

console.log("=== Exercise 1: Async Error Handling ===\n");

// ============================================
// CHALLENGE 1: Sequential Operations
// ============================================

console.log("Challenge 1: Sequential Operations with Error Handling");
console.log("------------------------------------------------------");

/**
 * Task: Implement a function that reads multiple files sequentially.
 * - If a file fails, try to continue with the next one
 * - Collect both successful results and errors
 * - Return summary of what succeeded and what failed
 */

async function readFilesSequentially(filePaths) {
  // TODO: Implement this function
  // Hint: Use a loop and try-catch for each file
  // Return: { successes: [...], failures: [...] }

  throw new Error("Not implemented");
}

// Test your implementation
async function testChallenge1() {
  const files = [
    __filename, // This file exists
    "nonexistent1.txt", // Doesn't exist
    path.join(__dirname, "package.json"), // Might not exist
    path.join(__dirname, "../README.md"), // Should exist
  ];

  try {
    const result = await readFilesSequentially(files);
    console.log("\n✓ Results:");
    console.log("  Successes:", result.successes.length);
    console.log("  Failures:", result.failures.length);
    result.failures.forEach((f) => console.log("    -", f.file, ":", f.error));
  } catch (error) {
    console.log("✗ Test failed:", error.message);
  }
}

// Uncomment to test:
// testChallenge1().then(() => console.log('\n'));

// ============================================
// CHALLENGE 2: Parallel Requests with Timeout
// ============================================

setTimeout(() => {
  console.log("Challenge 2: Parallel Requests with Timeout");
  console.log("--------------------------------------------");

  /**
   * Task: Implement a function that fetches data from multiple sources in parallel
   * - Set a timeout for each request
   * - If a request times out, mark it as failed but continue
   * - Use Promise.allSettled to wait for all attempts
   * - Return successful results and timeout errors
   */

  // Simulate API calls with varying delays
  function simulateAPICall(id, delay) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (delay > 2000) {
          reject(new Error(`API ${id} too slow`));
        } else {
          resolve({ id, data: `Data from API ${id}` });
        }
      }, delay);
    });
  }

  async function fetchWithTimeout(promise, timeoutMs) {
    // TODO: Implement timeout logic
    // Hint: Use Promise.race with a timeout promise
    // If timeout occurs, reject with a timeout error

    throw new Error("Not implemented");
  }

  async function fetchAllAPIs(apiConfigs, timeoutMs) {
    // TODO: Implement this function
    // - Use fetchWithTimeout for each API call
    // - Use Promise.allSettled to handle all results
    // - Return: { successes: [...], failures: [...], timeouts: [...] }

    throw new Error("Not implemented");
  }

  // Test your implementation
  async function testChallenge2() {
    const apis = [
      { id: 1, delay: 500 }, // Fast - should succeed
      { id: 2, delay: 1500 }, // Medium - should succeed
      { id: 3, delay: 3000 }, // Slow - should timeout
      { id: 4, delay: 2500 }, // Slow - should timeout
    ];

    try {
      const apiCalls = apis.map((api) => simulateAPICall(api.id, api.delay));
      const result = await fetchAllAPIs(apiCalls, 2000);

      console.log("\n✓ Results:");
      console.log("  Successes:", result.successes.length);
      console.log("  Failures:", result.failures.length);
      console.log("  Timeouts:", result.timeouts.length);
    } catch (error) {
      console.log("✗ Test failed:", error.message);
    }
  }

  // Uncomment to test:
  // testChallenge2().then(() => console.log('\n'));
}, 100);

// ============================================
// CHALLENGE 3: Retry Logic with Exponential Backoff
// ============================================

setTimeout(() => {
  console.log("Challenge 3: Retry with Exponential Backoff");
  console.log("--------------------------------------------");

  /**
   * Task: Implement a retry function with exponential backoff
   * - Retry a failing operation up to maxRetries times
   * - Wait longer between each retry (exponential backoff)
   * - If all retries fail, throw the last error
   * - Track and log each attempt
   */

  async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 100) {
    // TODO: Implement retry logic
    // Attempt 1: wait baseDelay ms
    // Attempt 2: wait baseDelay * 2 ms
    // Attempt 3: wait baseDelay * 4 ms
    // etc.

    throw new Error("Not implemented");
  }

  // Test your implementation
  async function testChallenge3() {
    let attemptCount = 0;

    async function flaky() {
      attemptCount++;
      console.log(`  Attempt ${attemptCount}...`);

      if (attemptCount < 3) {
        throw new Error("Service temporarily unavailable");
      }

      return "Success!";
    }

    try {
      const result = await retryWithBackoff(flaky, 5, 100);
      console.log("\n✓ Result:", result);
      console.log("  Total attempts:", attemptCount);
    } catch (error) {
      console.log("✗ All retries failed:", error.message);
    }
  }

  // Uncomment to test:
  // testChallenge3().then(() => console.log('\n'));
}, 200);

// ============================================
// CHALLENGE 4: Graceful Degradation
// ============================================

setTimeout(() => {
  console.log("Challenge 4: Graceful Degradation");
  console.log("----------------------------------");

  /**
   * Task: Implement a data fetching service with multiple fallbacks
   * 1. Try to fetch from cache (fast, might fail)
   * 2. If cache fails, try primary database (slower, might fail)
   * 3. If primary fails, try backup database (slowest, might fail)
   * 4. If all fail, return a default value
   *
   * Log each attempt and final source of data.
   */

  class DataSource {
    constructor(name, delay, failureRate) {
      this.name = name;
      this.delay = delay;
      this.failureRate = failureRate;
    }

    async fetch(key) {
      await new Promise((resolve) => setTimeout(resolve, this.delay));

      if (Math.random() < this.failureRate) {
        throw new Error(`${this.name} failed`);
      }

      return { source: this.name, data: `Data for ${key}` };
    }
  }

  async function fetchWithFallbacks(key, sources, defaultValue) {
    // TODO: Implement fallback logic
    // - Try each source in order
    // - If one fails, try the next
    // - Log each attempt
    // - Return data with metadata about which source provided it
    // - If all fail, return defaultValue

    throw new Error("Not implemented");
  }

  // Test your implementation
  async function testChallenge4() {
    const sources = [
      new DataSource("Cache", 50, 0.8), // Fast but unreliable
      new DataSource("Primary DB", 200, 0.5), // Medium speed, medium reliability
      new DataSource("Backup DB", 500, 0.2), // Slow but reliable
    ];

    // Run multiple tests to see different fallback paths
    for (let i = 0; i < 3; i++) {
      console.log(`\n  Test ${i + 1}:`);
      try {
        const result = await fetchWithFallbacks("user:123", sources, {
          source: "default",
          data: "Default data",
        });
        console.log("  ✓ Got data from:", result.source);
      } catch (error) {
        console.log("  ✗ Error:", error.message);
      }
    }
  }

  // Uncomment to test:
  // testChallenge4().then(() => console.log('\n'));
}, 300);

// ============================================
// SOLUTIONS
// ============================================

setTimeout(() => {
  console.log("\n=== SOLUTIONS ===\n");
  console.log(
    "Uncomment the test functions above to verify your implementation."
  );
  console.log("Compare your solution with the one below:\n");

  // Solution for Challenge 1
  async function readFilesSequentiallySolution(filePaths) {
    const successes = [];
    const failures = [];

    for (const filePath of filePaths) {
      try {
        const content = await fs.readFile(filePath, "utf8");
        successes.push({ file: filePath, size: content.length });
      } catch (error) {
        failures.push({ file: filePath, error: error.message });
      }
    }

    return { successes, failures };
  }

  console.log("Solution 1: See readFilesSequentiallySolution() above");
  console.log("Key points:");
  console.log("- Use for...of loop to process sequentially");
  console.log("- Try-catch inside the loop");
  console.log("- Collect both successes and failures");
  console.log();

  // Solution for Challenge 2
  async function fetchWithTimeoutSolution(promise, timeoutMs) {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Timeout")), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  console.log("Solution 2: See fetchWithTimeoutSolution() above");
  console.log("Key points:");
  console.log("- Use Promise.race with a timeout promise");
  console.log("- Categorize results from Promise.allSettled");
  console.log();

  // Solution for Challenge 3
  async function retryWithBackoffSolution(fn, maxRetries = 3, baseDelay = 100) {
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (i < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, i);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  console.log("Solution 3: See retryWithBackoffSolution() above");
  console.log("Key points:");
  console.log("- Exponential backoff: baseDelay * 2^attempt");
  console.log("- Track last error to throw if all fail");
  console.log();

  // Solution for Challenge 4
  async function fetchWithFallbacksSolution(key, sources, defaultValue) {
    for (const source of sources) {
      try {
        console.log(`    Trying ${source.name}...`);
        const result = await source.fetch(key);
        console.log(`    ✓ ${source.name} succeeded`);
        return result;
      } catch (error) {
        console.log(`    ✗ ${source.name} failed:`, error.message);
        // Continue to next source
      }
    }

    console.log("    → Using default value");
    return defaultValue;
  }

  console.log("Solution 4: See fetchWithFallbacksSolution() above");
  console.log("Key points:");
  console.log("- Try each source in order");
  console.log("- Log attempts for visibility");
  console.log("- Return first success or default");
}, 400);

console.log("\n=== Getting Started ===");
console.log("1. Read each challenge carefully");
console.log("2. Implement the TODO functions");
console.log("3. Uncomment the test functions to verify");
console.log("4. Compare with solutions at the bottom");
console.log("5. Run: node exercise-1-async-errors.js\n");
