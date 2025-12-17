/**
 * 01 - Synchronous Error Handling
 *
 * Learn how to handle errors in synchronous code using try-catch blocks.
 * This is the most straightforward error handling pattern.
 */

console.log("=== Synchronous Error Handling ===\n");

// ============================================
// 1. Basic Try-Catch
// ============================================

console.log("1. Basic Try-Catch:");

try {
  console.log("  Before error");
  throw new Error("Something went wrong!");
  console.log("  After error (never runs)");
} catch (error) {
  console.log("  ✓ Caught error:", error.message);
}

console.log("  Program continues...\n");

// ============================================
// 2. The Error Object
// ============================================

console.log("2. Error Object Properties:");

try {
  const user = null;
  user.name.toUpperCase(); // Will throw TypeError
} catch (error) {
  console.log("  Type:", error.constructor.name);
  console.log("  Message:", error.message);
  console.log("  Stack trace (first 2 lines):");
  console.log("  " + error.stack.split("\n").slice(0, 2).join("\n  "));
}

console.log();

// ============================================
// 3. Different Error Types
// ============================================

console.log("3. Built-in Error Types:");

// TypeError
try {
  null.toString();
} catch (error) {
  console.log("  TypeError:", error.message);
}

// ReferenceError
try {
  console.log(undefinedVariable);
} catch (error) {
  console.log("  ReferenceError:", error.message);
}

// RangeError
try {
  const arr = new Array(-1);
} catch (error) {
  console.log("  RangeError:", error.message);
}

// SyntaxError (harder to catch at runtime)
try {
  eval("const x = {");
} catch (error) {
  console.log("  SyntaxError:", error.message);
}

console.log();

// ============================================
// 4. Rethrowing Errors
// ============================================

console.log("4. Rethrowing Errors:");

function processData(data) {
  try {
    if (!data) {
      throw new Error("No data provided");
    }
    // Process data...
    return data.toUpperCase();
  } catch (error) {
    console.log("  ⚠️  Error in processData:", error.message);
    throw error; // Rethrow for caller to handle
  }
}

try {
  processData(null);
} catch (error) {
  console.log("  ✓ Caught rethrown error in main");
}

console.log();

// ============================================
// 5. Finally Block
// ============================================

console.log("5. Finally Block (always runs):");

function readFile(filename) {
  console.log("  Opening file:", filename);

  try {
    if (!filename) {
      throw new Error("Filename is required");
    }
    console.log("  Reading file...");
    // Simulate file reading
    return "file contents";
  } catch (error) {
    console.log("  ✗ Error:", error.message);
    return null;
  } finally {
    console.log("  Closing file (cleanup)");
  }
}

const result1 = readFile("data.txt");
console.log("  Result:", result1);
console.log();

const result2 = readFile(null);
console.log("  Result:", result2);
console.log();

// ============================================
// 6. Nested Try-Catch
// ============================================

console.log("6. Nested Try-Catch:");

try {
  console.log("  Outer try");

  try {
    console.log("  Inner try");
    throw new Error("Inner error");
  } catch (innerError) {
    console.log("  ✓ Caught in inner catch:", innerError.message);
    throw new Error("Handled inner, throwing outer");
  }
} catch (outerError) {
  console.log("  ✓ Caught in outer catch:", outerError.message);
}

console.log();

// ============================================
// 7. When NOT to Use Try-Catch
// ============================================

console.log("7. Try-Catch Limitations:");

// ❌ Try-catch CANNOT catch async errors
console.log("  ❌ This will NOT be caught:");

try {
  setTimeout(() => {
    throw new Error("Async error"); // Uncaught!
  }, 100);
} catch (error) {
  console.log("  This never runs");
}

console.log("  (Wait 200ms for the uncaught error...)");

// Give time to see the async error
setTimeout(() => {
  console.log("\n  ✓ See? The error above was not caught!");
  console.log("  For async errors, you need different patterns.");

  console.log("\n=== Key Takeaways ===");
  console.log("✓ Use try-catch for synchronous code");
  console.log("✓ Always include a catch block or finally");
  console.log("✓ Errors have message, stack, and type");
  console.log("✓ You can rethrow errors for higher-level handling");
  console.log("✓ Finally always runs (cleanup code)");
  console.log("✗ Try-catch does NOT work with async code!");
}, 200);
