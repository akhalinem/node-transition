/**
 * 04 - Async/Await Error Handling
 *
 * Learn how to handle errors with async/await using try-catch.
 * This is the modern and most readable way to handle async errors.
 */

console.log("=== Async/Await Error Handling ===\n");

// ============================================
// 1. Basic Try-Catch with Async/Await
// ============================================

console.log("1. Basic Try-Catch with Async/Await:");

async function fetchData(shouldFail) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error("Fetch failed"));
      } else {
        resolve("Fetch succeeded");
      }
    }, 100);
  });
}

async function example1() {
  try {
    const data = await fetchData(false);
    console.log("  ✓ Success:", data);
  } catch (error) {
    console.log("  ✗ Error:", error.message);
  }

  try {
    const data = await fetchData(true);
    console.log("  ✓ Success:", data);
  } catch (error) {
    console.log("  ✗ Caught error:", error.message);
  }
}

example1();

// ============================================
// 2. Multiple Async Operations
// ============================================

setTimeout(async () => {
  console.log("\n2. Multiple Async Operations:");

  async function step1() {
    console.log("  → Executing step 1...");
    await new Promise((resolve) => setTimeout(resolve, 100));
    return "Data from step 1";
  }

  async function step2(data) {
    console.log("  → Executing step 2 with:", data);
    await new Promise((resolve) => setTimeout(resolve, 100));
    return "Data from step 2";
  }

  async function step3(data) {
    console.log("  → Executing step 3 with:", data);
    await new Promise((resolve) => setTimeout(resolve, 100));
    throw new Error("Step 3 failed!");
  }

  try {
    const result1 = await step1();
    const result2 = await step2(result1);
    const result3 = await step3(result2);
    console.log("  ✓ All steps succeeded");
  } catch (error) {
    console.log("  ✗ Operation failed:", error.message);
    console.log("    (One try-catch for entire sequence!)");
  }
}, 300);

// ============================================
// 3. Error Recovery
// ============================================

setTimeout(async () => {
  console.log("\n3. Error Recovery with Fallback:");

  async function fetchWithFallback() {
    try {
      const data = await fetchData(true);
      return data;
    } catch (error) {
      console.log("  ✗ Primary source failed:", error.message);
      console.log("  → Trying fallback...");

      // Return fallback value
      return "Fallback data";
    }
  }

  const result = await fetchWithFallback();
  console.log("  ✓ Final result:", result);
}, 800);

// ============================================
// 4. Parallel Operations with Promise.all
// ============================================

setTimeout(async () => {
  console.log("\n4. Parallel Operations:");

  async function fetchUser() {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return { name: "John", id: 1 };
  }

  async function fetchPosts() {
    await new Promise((resolve) => setTimeout(resolve, 100));
    throw new Error("Posts service down");
  }

  async function fetchComments() {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return ["comment1", "comment2"];
  }

  try {
    console.log("  → Fetching all data in parallel...");
    const [user, posts, comments] = await Promise.all([
      fetchUser(),
      fetchPosts(),
      fetchComments(),
    ]);
    console.log("  ✓ All data fetched");
  } catch (error) {
    console.log("  ✗ One or more requests failed:", error.message);
  }
}, 1100);

// ============================================
// 5. Graceful Parallel with allSettled
// ============================================

setTimeout(async () => {
  console.log("\n5. Graceful Parallel with allSettled:");

  async function fetchUser() {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return { name: "John" };
  }

  async function fetchPosts() {
    await new Promise((resolve) => setTimeout(resolve, 100));
    throw new Error("Posts failed");
  }

  async function fetchComments() {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return ["comment1"];
  }

  console.log("  → Fetching all data...");
  const results = await Promise.allSettled([
    fetchUser(),
    fetchPosts(),
    fetchComments(),
  ]);

  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      console.log(`  ✓ Request ${i + 1} succeeded`);
    } else {
      console.log(`  ✗ Request ${i + 1} failed:`, result.reason.message);
    }
  });

  // Extract successful results
  const user = results[0].status === "fulfilled" ? results[0].value : null;
  const comments = results[2].status === "fulfilled" ? results[2].value : [];

  console.log("  → Using partial results:", { user, comments });
}, 1500);

// ============================================
// 6. Finally Block with Async/Await
// ============================================

setTimeout(async () => {
  console.log("\n6. Finally Block for Cleanup:");

  async function processWithCleanup(shouldFail) {
    console.log("  → Starting process...");

    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (shouldFail) {
            reject(new Error("Process failed"));
          } else {
            resolve();
          }
        }, 100);
      });

      console.log("  ✓ Process succeeded");
    } catch (error) {
      console.log("  ✗ Process failed:", error.message);
      throw error;
    } finally {
      console.log("  → Cleanup (always runs)");
    }
  }

  // Success case
  try {
    await processWithCleanup(false);
  } catch (error) {
    // Handled
  }

  console.log();

  // Failure case
  try {
    await processWithCleanup(true);
  } catch (error) {
    console.log("  Caught in outer handler");
  }
}, 2000);

// ============================================
// 7. Common Mistake: Forgetting Await
// ============================================

setTimeout(async () => {
  console.log("\n7. Common Mistake - Forgetting Await:");

  // ❌ Without await - error NOT caught!
  async function mistake() {
    try {
      fetchData(true); // Forgot await!
      console.log("  This runs immediately");
    } catch (error) {
      console.log("  ✗ This never runs");
    }
  }

  // ✓ With await - error IS caught
  async function correct() {
    try {
      await fetchData(true); // Proper await
      console.log("  This never runs");
    } catch (error) {
      console.log("  ✓ Error caught correctly:", error.message);
    }
  }

  await mistake();

  // Wait a bit to avoid unhandled rejection
  await new Promise((resolve) => setTimeout(resolve, 200));

  await correct();
}, 2600);

// ============================================
// 8. Error Boundaries Pattern
// ============================================

setTimeout(async () => {
  console.log("\n8. Error Boundaries Pattern:");

  async function riskyOperation() {
    throw new Error("Something went wrong");
  }

  async function errorBoundary(operation, fallback) {
    try {
      return await operation();
    } catch (error) {
      console.log("  ⚠️  Caught in boundary:", error.message);
      return fallback;
    }
  }

  const result = await errorBoundary(riskyOperation, "Safe default value");

  console.log("  ✓ Result:", result);
}, 3100);

// ============================================
// 9. Retrying Failed Operations
// ============================================

setTimeout(async () => {
  console.log("\n9. Retry Pattern:");

  let attemptCount = 0;

  async function unreliableOperation() {
    attemptCount++;
    console.log(`  → Attempt ${attemptCount}...`);

    if (attemptCount < 3) {
      throw new Error("Operation failed");
    }

    return "Success!";
  }

  async function retry(operation, maxRetries = 3, delay = 100) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        console.log(`  ✗ Attempt ${i + 1} failed:`, error.message);

        if (i < maxRetries - 1) {
          console.log(`  → Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }
  }

  try {
    const result = await retry(unreliableOperation);
    console.log("  ✓ Final result:", result);
  } catch (error) {
    console.log("  ✗ All retries failed");
  }
}, 3300);

// ============================================
// 10. Wrapping Callbacks as Async
// ============================================

setTimeout(async () => {
  console.log("\n10. Wrapping Callbacks as Async:");

  const fs = require("fs");
  const { promisify } = require("util");

  // Convert callback to promise
  const readFileAsync = promisify(fs.readFile);

  async function readFileExample() {
    try {
      const data = await readFileAsync(__filename, "utf8");
      console.log("  ✓ File read successfully");
      console.log("    Size:", data.length, "characters");
    } catch (error) {
      console.log("  ✗ Error reading file:", error.message);
    }
  }

  await readFileExample();
}, 3900);

// ============================================
// Summary
// ============================================

setTimeout(() => {
  console.log("\n=== Key Takeaways ===");
  console.log("✓ Use try-catch with async/await for clean error handling");
  console.log("✓ One try-catch can handle multiple awaits");
  console.log("✓ Use Promise.allSettled() for graceful parallel failures");
  console.log("✓ Finally block always runs (cleanup)");
  console.log("✓ ALWAYS use await - forgot await = error not caught!");
  console.log("✓ Error boundaries provide fallback values");
  console.log("✓ Retry pattern useful for flaky operations");
  console.log("💡 Async/await is the cleanest way to handle async errors!");
}, 4100);
