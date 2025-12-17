/**
 * 02 - Callback Error Handling
 *
 * Learn the Node.js error-first callback pattern.
 * This is a fundamental pattern in traditional Node.js code.
 */

const fs = require("fs");
const path = require("path");

console.log("=== Callback Error Handling ===\n");

// ============================================
// 1. Error-First Callback Pattern
// ============================================

console.log("1. Error-First Callback Pattern:");

/**
 * Standard Node.js pattern:
 * - First parameter is always the error (null if no error)
 * - Subsequent parameters are success data
 */

function simulateAsync(shouldFail, callback) {
  setTimeout(() => {
    if (shouldFail) {
      // Pass error as first argument
      callback(new Error("Operation failed"));
    } else {
      // Pass null for error, data as second argument
      callback(null, "Success data");
    }
  }, 100);
}

// ✓ Correct usage
simulateAsync(false, (err, data) => {
  if (err) {
    console.log("  ✗ Error:", err.message);
    return; // Always return early on error
  }
  console.log("  ✓ Success:", data);
});

setTimeout(() => {
  simulateAsync(true, (err, data) => {
    if (err) {
      console.log("  ✗ Error:", err.message);
      return;
    }
    console.log("  ✓ Success:", data);
  });
}, 150);

// ============================================
// 2. Real File System Example
// ============================================

setTimeout(() => {
  console.log("\n2. Real fs.readFile Example:");

  // Try to read a non-existent file
  fs.readFile("nonexistent.txt", "utf8", (err, data) => {
    if (err) {
      console.log("  ✗ Error reading file:");
      console.log("    Code:", err.code); // 'ENOENT'
      console.log("    Message:", err.message);
      return;
    }
    console.log("  ✓ File contents:", data);
  });

  // Try to read this current file
  fs.readFile(__filename, "utf8", (err, data) => {
    if (err) {
      console.log("  ✗ Error:", err.message);
      return;
    }
    console.log("  ✓ Successfully read current file");
    console.log("    Length:", data.length, "characters");
  });
}, 300);

// ============================================
// 3. Callback Hell (Anti-Pattern)
// ============================================

setTimeout(() => {
  console.log("\n3. Callback Hell (Multiple Async Operations):");

  // ❌ This is hard to read and maintain!
  fs.readFile(__filename, "utf8", (err1, data1) => {
    if (err1) {
      console.log("  ✗ Error 1:", err1.message);
      return;
    }

    console.log("  ✓ Read file 1");

    fs.readFile(__filename, "utf8", (err2, data2) => {
      if (err2) {
        console.log("  ✗ Error 2:", err2.message);
        return;
      }

      console.log("  ✓ Read file 2");

      fs.readFile(__filename, "utf8", (err3, data3) => {
        if (err3) {
          console.log("  ✗ Error 3:", err3.message);
          return;
        }

        console.log("  ✓ Read file 3 (nested too deep!)");
      });
    });
  });
}, 500);

// ============================================
// 4. Better Pattern: Named Functions
// ============================================

setTimeout(() => {
  console.log("\n4. Better: Named Functions:");

  function handleFile1(err, data) {
    if (err) {
      console.log("  ✗ Error in step 1:", err.message);
      return;
    }
    console.log("  ✓ Step 1 complete");
    fs.readFile(__filename, "utf8", handleFile2);
  }

  function handleFile2(err, data) {
    if (err) {
      console.log("  ✗ Error in step 2:", err.message);
      return;
    }
    console.log("  ✓ Step 2 complete");
    fs.readFile(__filename, "utf8", handleFile3);
  }

  function handleFile3(err, data) {
    if (err) {
      console.log("  ✗ Error in step 3:", err.message);
      return;
    }
    console.log("  ✓ All steps complete! (more readable)");
  }

  fs.readFile(__filename, "utf8", handleFile1);
}, 700);

// ============================================
// 5. Custom Error-First Functions
// ============================================

setTimeout(() => {
  console.log("\n5. Writing Your Own Error-First Functions:");

  function divideAsync(a, b, callback) {
    // Simulate async operation
    setImmediate(() => {
      // Validate input
      if (typeof a !== "number" || typeof b !== "number") {
        return callback(new Error("Both arguments must be numbers"));
      }

      if (b === 0) {
        return callback(new Error("Division by zero"));
      }

      // Success case: error is null
      callback(null, a / b);
    });
  }

  // Test success case
  divideAsync(10, 2, (err, result) => {
    if (err) {
      console.log("  ✗ Error:", err.message);
      return;
    }
    console.log("  ✓ 10 / 2 =", result);
  });

  // Test error case
  divideAsync(10, 0, (err, result) => {
    if (err) {
      console.log("  ✗ Error:", err.message);
      return;
    }
    console.log("  ✓ Result:", result);
  });
}, 900);

// ============================================
// 6. Common Mistakes
// ============================================

setTimeout(() => {
  console.log("\n6. Common Callback Mistakes:");

  function badExample(callback) {
    setTimeout(() => {
      // ❌ MISTAKE 1: Not returning after callback
      if (Math.random() > 0.5) {
        callback(new Error("Random failure"));
        // Code continues! Could call callback twice!
      }

      // ❌ MISTAKE 2: Calling callback twice
      callback(null, "success");
      // callback(null, 'again'); // Never do this!
    }, 10);
  }

  function goodExample(callback) {
    setTimeout(() => {
      // ✓ CORRECT: Always return after callback
      if (Math.random() > 0.5) {
        return callback(new Error("Random failure"));
      }

      return callback(null, "success");
      // Nothing runs after this
    }, 10);
  }

  console.log("  ✓ Study the source code for common mistakes");

  goodExample((err, data) => {
    if (err) {
      console.log("  Good example handled correctly");
    }
  });
}, 1100);

// ============================================
// Summary
// ============================================

setTimeout(() => {
  console.log("\n=== Key Takeaways ===");
  console.log("✓ Error-first callbacks: (err, data) => {}");
  console.log("✓ Always check for error first: if (err) return;");
  console.log("✓ Pass null for error on success");
  console.log("✓ Return early after callback to avoid double-calling");
  console.log("✓ Use named functions to avoid callback hell");
  console.log("✗ Try-catch does NOT work with callbacks");
  console.log("💡 Modern code uses Promises/async-await instead!");
}, 1300);
