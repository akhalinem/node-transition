/**
 * 03 - Promise Error Handling
 *
 * Learn how to handle errors with Promises using .catch() and .finally().
 * Promises provide a cleaner alternative to callbacks.
 */

console.log("=== Promise Error Handling ===\n");

// ============================================
// 1. Basic Promise Rejection
// ============================================

console.log("1. Basic Promise Rejection:");

const successPromise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("Success!");
  }, 100);
});

const failurePromise = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject(new Error("Something failed!"));
  }, 100);
});

successPromise
  .then((result) => {
    console.log("  ✓ Success:", result);
  })
  .catch((error) => {
    console.log("  ✗ Error:", error.message);
  });

failurePromise
  .then((result) => {
    console.log("  ✓ Success:", result);
  })
  .catch((error) => {
    console.log("  ✗ Caught error:", error.message);
  });

// ============================================
// 2. Chaining with Error Handling
// ============================================

setTimeout(() => {
  console.log("\n2. Promise Chaining:");

  function step1() {
    return new Promise((resolve) => {
      console.log("  → Step 1 executing...");
      setTimeout(() => resolve("Data from step 1"), 100);
    });
  }

  function step2(data) {
    return new Promise((resolve) => {
      console.log("  → Step 2 executing with:", data);
      setTimeout(() => resolve("Data from step 2"), 100);
    });
  }

  function step3(data) {
    return new Promise((resolve, reject) => {
      console.log("  → Step 3 executing with:", data);
      setTimeout(() => reject(new Error("Step 3 failed!")), 100);
    });
  }

  step1()
    .then(step2)
    .then(step3)
    .then((result) => {
      console.log("  ✓ All steps succeeded:", result);
    })
    .catch((error) => {
      console.log("  ✗ Chain failed:", error.message);
      console.log("    (Catch handles ANY error in the chain)");
    });
}, 300);

// ============================================
// 3. Error Recovery
// ============================================

setTimeout(() => {
  console.log("\n3. Recovering from Errors:");

  Promise.reject(new Error("Initial failure"))
    .catch((error) => {
      console.log("  ✗ Caught error:", error.message);
      console.log("  → Recovering with fallback value...");
      return "Recovered!"; // Return value creates resolved promise
    })
    .then((result) => {
      console.log("  ✓ Chain continues:", result);
    });
}, 800);

// ============================================
// 4. Throwing Errors in .then()
// ============================================

setTimeout(() => {
  console.log("\n4. Throwing Errors in .then():");

  Promise.resolve("Initial value")
    .then((value) => {
      console.log("  → Processing:", value);
      throw new Error("Error in .then()");
    })
    .then((value) => {
      console.log("  This never runs");
    })
    .catch((error) => {
      console.log("  ✗ Caught thrown error:", error.message);
    });
}, 1000);

// ============================================
// 5. Multiple Catch Blocks
// ============================================

setTimeout(() => {
  console.log("\n5. Multiple Catch Blocks:");

  Promise.reject(new Error("First error"))
    .catch((error) => {
      console.log("  ✗ First catch:", error.message);
      throw new Error("Error from first catch");
    })
    .catch((error) => {
      console.log("  ✗ Second catch:", error.message);
      return "Recovered in second catch";
    })
    .then((result) => {
      console.log("  ✓ Final result:", result);
    });
}, 1200);

// ============================================
// 6. Finally Block
// ============================================

setTimeout(() => {
  console.log("\n6. Finally Block (cleanup):");

  function fetchWithCleanup(shouldFail) {
    console.log("  → Starting fetch...");

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldFail) {
          reject(new Error("Fetch failed"));
        } else {
          resolve("Fetch succeeded");
        }
      }, 100);
    })
      .then((result) => {
        console.log("  ✓ Result:", result);
        return result;
      })
      .catch((error) => {
        console.log("  ✗ Error:", error.message);
        throw error; // Re-throw
      })
      .finally(() => {
        console.log("  → Cleanup (always runs)");
      });
  }

  // Success case
  fetchWithCleanup(false)
    .then(() => console.log("  Done with success case\n"))
    .catch(() => {});

  // Failure case
  setTimeout(() => {
    fetchWithCleanup(true)
      .then(() => {})
      .catch(() => console.log("  Done with failure case"));
  }, 300);
}, 1400);

// ============================================
// 7. Promise.all() Error Handling
// ============================================

setTimeout(() => {
  console.log("\n7. Promise.all() Error Handling:");

  const p1 = Promise.resolve("Success 1");
  const p2 = Promise.reject(new Error("Failure 2"));
  const p3 = Promise.resolve("Success 3");

  // Promise.all fails fast - rejects on first error
  Promise.all([p1, p2, p3])
    .then((results) => {
      console.log("  ✓ All succeeded:", results);
    })
    .catch((error) => {
      console.log("  ✗ First error:", error.message);
      console.log("    (Other promises are ignored)");
    });
}, 2100);

// ============================================
// 8. Promise.allSettled()
// ============================================

setTimeout(() => {
  console.log("\n8. Promise.allSettled() (waits for all):");

  const promises = [
    Promise.resolve("Success 1"),
    Promise.reject(new Error("Failure 2")),
    Promise.resolve("Success 3"),
  ];

  Promise.allSettled(promises).then((results) => {
    console.log("  All promises settled:");
    results.forEach((result, i) => {
      if (result.status === "fulfilled") {
        console.log(`    [${i}] ✓ Fulfilled:`, result.value);
      } else {
        console.log(`    [${i}] ✗ Rejected:`, result.reason.message);
      }
    });
  });
}, 2300);

// ============================================
// 9. Unhandled Promise Rejection
// ============================================

setTimeout(() => {
  console.log("\n9. Unhandled Promise Rejection:");

  // ❌ This will trigger an unhandled rejection warning
  console.log("  Creating promise without .catch()...");

  // Set up listener before creating unhandled rejection
  const unhandledListener = (reason, promise) => {
    console.log("  ⚠️  Unhandled rejection detected!");
    console.log("    Reason:", reason.message);
  };

  process.on("unhandledRejection", unhandledListener);

  // This creates an unhandled rejection
  Promise.reject(new Error("Unhandled rejection!"));

  setTimeout(() => {
    process.removeListener("unhandledRejection", unhandledListener);
    console.log("  (Removed listener)");
  }, 100);
}, 2500);

// ============================================
// 10. Converting Callbacks to Promises
// ============================================

setTimeout(() => {
  console.log("\n10. Converting Callbacks to Promises:");

  const fs = require("fs");
  const { promisify } = require("util");

  // Manual conversion
  function readFilePromise(filename) {
    return new Promise((resolve, reject) => {
      fs.readFile(filename, "utf8", (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  // Or use built-in promisify
  const readFileAsync = promisify(fs.readFile);

  readFileAsync(__filename, "utf8")
    .then((data) => {
      console.log("  ✓ Read file successfully");
      console.log("    Length:", data.length, "characters");
    })
    .catch((error) => {
      console.log("  ✗ Error:", error.message);
    });
}, 2800);

// ============================================
// Summary
// ============================================

setTimeout(() => {
  console.log("\n=== Key Takeaways ===");
  console.log("✓ Use .catch() to handle promise rejections");
  console.log("✓ .catch() handles any error in the promise chain");
  console.log("✓ Returning a value in .catch() recovers the chain");
  console.log("✓ Throwing in .then() creates a rejection");
  console.log("✓ .finally() runs for both success and failure");
  console.log("✓ Promise.all() fails fast, allSettled() waits for all");
  console.log("✓ Always handle rejections to avoid unhandled warnings");
  console.log(
    "💡 Promises are better than callbacks, but async/await is even better!"
  );
}, 3000);
