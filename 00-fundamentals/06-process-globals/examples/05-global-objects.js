/**
 * 05 - Global Objects
 *
 * Learn about global objects available in Node.js without requiring them.
 * Understanding these is essential for writing Node.js code.
 */

console.log("=== Global Objects in Node.js ===\n");

// ============================================
// 1. Core Globals (Always Available)
// ============================================

console.log("1. Core Global Objects:");

console.log("  console      - Logging and debugging");
console.log("  process      - Current process information");
console.log("  Buffer       - Binary data handling");
console.log("  setTimeout   - Timer functions");
console.log("  setInterval  - Interval functions");
console.log("  setImmediate - Next event loop tick");
console.log("  global       - Global namespace (like 'window' in browsers)");

console.log();

// ============================================
// 2. Console Object
// ============================================

console.log("2. Console Methods:");

// Basic logging
console.log("  console.log()   - General output");
console.info("  console.info()  - Informational (alias for log)");
console.warn("  console.warn()  - Warnings");
console.error("  console.error() - Errors (writes to stderr)");

// Timing
console.time("operation");
// Do some work
for (let i = 0; i < 1000000; i++) {}
console.timeEnd("operation");

// Assertions
console.assert(1 + 1 === 2, "Math works!"); // Silent if true
// console.assert(1 + 1 === 3, 'Math broken!'); // Logs error if false

// Table format (great for objects/arrays)
const users = [
  { id: 1, name: "Alice", role: "Admin" },
  { id: 2, name: "Bob", role: "User" },
  { id: 3, name: "Charlie", role: "User" },
];
console.table(users);

// Count occurrences
console.count("requests"); // requests: 1
console.count("requests"); // requests: 2
console.count("requests"); // requests: 3
console.countReset("requests");
console.count("requests"); // requests: 1

// Stack trace
console.trace("  Debug trace:");

// Group related logs
console.group("  Grouped logs:");
console.log("Item 1");
console.log("Item 2");
console.groupEnd();

console.log();

// ============================================
// 3. Timers
// ============================================

console.log("3. Timer Functions:");

// setTimeout - Execute after delay
const timeout = setTimeout(() => {
  console.log("  ⏰ setTimeout executed (1 second)");
}, 1000);

// setInterval - Execute repeatedly
let count = 0;
const interval = setInterval(() => {
  count++;
  console.log(`  🔄 setInterval tick ${count}`);

  if (count >= 3) {
    clearInterval(interval);
    console.log("  ✓ Interval cleared");
  }
}, 500);

// setImmediate - Execute on next event loop iteration
setImmediate(() => {
  console.log("  ⚡ setImmediate executed (next tick)");
});

// setTimeout with 0 delay (runs after setImmediate)
setTimeout(() => {
  console.log("  ⏰ setTimeout(0) executed (after setImmediate)");
}, 0);

// Timer objects can be unref'd (won't keep process alive)
const unrefTimer = setTimeout(() => {
  console.log("This won't keep process alive");
}, 10000);
unrefTimer.unref();

console.log("  ℹ️  Timers scheduled...\n");

// ============================================
// 4. Process Timers (Special)
// ============================================

console.log("4. process.nextTick():");

// process.nextTick - Execute before next event loop phase
process.nextTick(() => {
  console.log("  🎯 process.nextTick (runs BEFORE setImmediate)");
});

console.log("  Order: nextTick → setImmediate → setTimeout(0)");

console.log();

// ============================================
// 5. Buffer Global
// ============================================

setTimeout(() => {
  console.log("\n5. Buffer Global:");

  // Create buffers
  const buf1 = Buffer.from("Hello, World!");
  const buf2 = Buffer.alloc(10); // Filled with zeros
  const buf3 = Buffer.allocUnsafe(10); // Faster, but contains old data

  console.log("  From string:", buf1);
  console.log("  To string:", buf1.toString());
  console.log("  Buffer length:", buf1.length, "bytes");

  // Buffer is available globally (no require needed)
  console.log("  Type:", typeof Buffer); // 'function'
  console.log("  Is global:", global.Buffer === Buffer); // true

  console.log();
}, 2000);

// ============================================
// 6. URL and URLSearchParams
// ============================================

setTimeout(() => {
  console.log("6. URL Globals:");

  // URL parsing (no require needed in modern Node.js)
  const url = new URL("https://example.com:8080/path?foo=bar&baz=qux#hash");

  console.log("  Protocol:", url.protocol);
  console.log("  Hostname:", url.hostname);
  console.log("  Port:", url.port);
  console.log("  Pathname:", url.pathname);
  console.log("  Search:", url.search);
  console.log("  Hash:", url.hash);

  // URLSearchParams for query strings
  const params = new URLSearchParams(url.search);
  console.log("  Query param 'foo':", params.get("foo"));
  console.log("  All params:");
  for (const [key, value] of params) {
    console.log(`    ${key} = ${value}`);
  }

  console.log();
}, 2500);

// ============================================
// 7. TextEncoder / TextDecoder
// ============================================

setTimeout(() => {
  console.log("7. Text Encoding Globals:");

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const text = "Hello, 世界! 🌍";
  const encoded = encoder.encode(text);

  console.log("  Original:", text);
  console.log("  Encoded (Uint8Array):", encoded);
  console.log("  Decoded:", decoder.decode(encoded));
  console.log("  Bytes:", encoded.length);

  console.log();
}, 3000);

// ============================================
// 8. Global Object vs Window
// ============================================

setTimeout(() => {
  console.log("8. Global Namespace:");

  console.log("  In browsers: window");
  console.log("  In Node.js: global");
  console.log("  In both (newer): globalThis");

  // Add to global namespace (generally avoid this!)
  global.myGlobalVariable = "I'm global!";
  console.log("  Custom global:", myGlobalVariable);

  // Better: use modules for sharing data
  console.log("\n  ⚠️  Avoid polluting global namespace!");
  console.log("  Use modules and exports instead");

  console.log();
}, 3500);

// ============================================
// 9. Module-Related Globals
// ============================================

setTimeout(() => {
  console.log("9. Module Globals (not really global, but look like it):");

  console.log("  __dirname  - Current directory:", __dirname);
  console.log("  __filename - Current file:", __filename);
  console.log("  require    - Module loading function");
  console.log("  module     - Current module object");
  console.log("  exports    - Module exports object");

  console.log("\n  ℹ️  These are actually injected into each module!");
  console.log("  They're not on the global object:");
  console.log("  global.__dirname:", global.__dirname); // undefined

  console.log();
}, 4000);

// ============================================
// 10. AbortController and AbortSignal
// ============================================

setTimeout(() => {
  console.log("10. AbortController (for cancellation):");

  const controller = new AbortController();
  const signal = controller.signal;

  // Example: Abortable timeout
  const abortableTimeout = setTimeout(
    () => {
      console.log("  This will be aborted");
    },
    5000,
    { signal }
  );

  // Abort the operation
  setTimeout(() => {
    controller.abort();
    console.log("  ✓ Operation aborted");
  }, 100);

  // Useful for fetch, file operations, etc.
  console.log("  Used for cancelling async operations");

  console.log();
}, 4500);

// ============================================
// 11. Web Crypto API
// ============================================

setTimeout(() => {
  console.log("11. Web Crypto API:");

  // Generate random values
  const array = new Uint32Array(5);
  crypto.getRandomValues(array);

  console.log("  Random values:", array);

  // Generate UUID
  const uuid = crypto.randomUUID();
  console.log("  Random UUID:", uuid);

  console.log();
}, 5000);

// ============================================
// 12. Performance API
// ============================================

setTimeout(() => {
  console.log("12. Performance API:");

  // High-resolution time
  const start = performance.now();

  // Do some work
  let sum = 0;
  for (let i = 0; i < 1000000; i++) {
    sum += i;
  }

  const end = performance.now();
  console.log("  Operation took:", (end - start).toFixed(3), "ms");

  // Performance marks
  performance.mark("start-operation");
  // ... do work ...
  performance.mark("end-operation");
  performance.measure("operation", "start-operation", "end-operation");

  const measure = performance.getEntriesByName("operation")[0];
  console.log("  Measured duration:", measure.duration.toFixed(3), "ms");

  console.log();
}, 5500);

// ============================================
// 13. Comparison: Browser vs Node.js Globals
// ============================================

setTimeout(() => {
  console.log("13. Browser vs Node.js Globals:");

  console.log("\n  Browser ONLY:");
  console.log("    window, document, navigator");
  console.log("    localStorage, sessionStorage");
  console.log("    XMLHttpRequest, fetch (now in Node.js too!)");

  console.log("\n  Node.js ONLY:");
  console.log("    __dirname, __filename");
  console.log("    require, module, exports");
  console.log("    process");

  console.log("\n  Both (Web Standard APIs in Node.js):");
  console.log("    console, setTimeout, setInterval");
  console.log("    URL, URLSearchParams");
  console.log("    TextEncoder, TextDecoder");
  console.log("    AbortController, AbortSignal");
  console.log("    crypto (Web Crypto API)");
  console.log("    fetch (Node.js 18+)");
  console.log("    performance");

  console.log();
}, 6000);

// ============================================
// 14. Fetch API (Node.js 18+)
// ============================================

setTimeout(async () => {
  console.log("14. Fetch API (Node.js 18+):");

  try {
    // Fetch is now global in Node.js!
    const response = await fetch("https://api.github.com/users/github");
    const data = await response.json();

    console.log("  ✓ Fetched GitHub user:");
    console.log("    Name:", data.name);
    console.log("    Public repos:", data.public_repos);
  } catch (error) {
    console.log("  ✗ Fetch failed:", error.message);
  }

  console.log();
}, 6500);

// ============================================
// Summary
// ============================================

setTimeout(() => {
  console.log("\n=== Key Takeaways ===");
  console.log("✓ Global objects are available without require/import");
  console.log("✓ console: Logging and debugging");
  console.log("✓ process: Process information and control");
  console.log("✓ Buffer: Binary data handling");
  console.log("✓ setTimeout/setInterval/setImmediate: Timers");
  console.log("✓ URL, URLSearchParams: URL parsing");
  console.log("✓ TextEncoder/TextDecoder: Text encoding");
  console.log("✓ crypto: Cryptographic functions");
  console.log("✓ fetch: HTTP requests (Node.js 18+)");
  console.log("✓ performance: High-resolution timing");
  console.log("✓ __dirname, __filename: Module-specific (not truly global)");
  console.log("✓ globalThis: Universal global object reference");
  console.log("\n⚠️  Avoid polluting global namespace - use modules!");

  process.exit(0);
}, 7500);
