/**
 * 01 - Process Object Basics
 *
 * Learn about the global `process` object in Node.js - your interface
 * to the current Node.js process and the operating system.
 */

console.log("=== Process Object Basics ===\n");

// ============================================
// 1. Process Information
// ============================================

console.log("1. Basic Process Information:");

console.log("  Process ID (PID):", process.pid);
console.log("  Parent Process ID:", process.ppid);
console.log("  Node.js version:", process.version);
console.log("  Platform:", process.platform); // darwin, linux, win32
console.log("  Architecture:", process.arch); // x64, arm, etc.
console.log("  Current directory:", process.cwd());
console.log("  Executable path:", process.execPath);

console.log();

// ============================================
// 2. Process Arguments
// ============================================

console.log("2. Command Line Arguments:");

// process.argv is an array:
// [0] = path to node executable
// [1] = path to the script being executed
// [2+] = your custom arguments

console.log("  All arguments:", process.argv);
console.log("  Node executable:", process.argv[0]);
console.log("  Script path:", process.argv[1]);
console.log("  Custom args:", process.argv.slice(2));

// Try running: node 01-process-basics.js --name=Alice --age=30
if (process.argv.length > 2) {
  console.log("\n  ✓ You passed arguments!");
  process.argv.slice(2).forEach((arg, index) => {
    console.log(`    Arg ${index + 1}:`, arg);
  });
} else {
  console.log("\n  ℹ️  Try: node 01-process-basics.js --name=Alice --age=30");
}

console.log();

// ============================================
// 3. Process Memory Usage
// ============================================

console.log("3. Memory Usage:");

const memoryUsage = process.memoryUsage();

console.log("  RSS (Resident Set Size):", formatBytes(memoryUsage.rss));
console.log("  Heap Total:", formatBytes(memoryUsage.heapTotal));
console.log("  Heap Used:", formatBytes(memoryUsage.heapUsed));
console.log("  External:", formatBytes(memoryUsage.external));
console.log("  Array Buffers:", formatBytes(memoryUsage.arrayBuffers));

console.log(
  "\n  Heap Usage:",
  `${((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100).toFixed(2)}%`
);

// Helper function
function formatBytes(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + " MB";
}

console.log();

// ============================================
// 4. Process Uptime & CPU Usage
// ============================================

console.log("4. Process Performance:");

console.log("  Uptime:", process.uptime().toFixed(2), "seconds");

const cpuUsage = process.cpuUsage();
console.log("  CPU User time:", cpuUsage.user, "microseconds");
console.log("  CPU System time:", cpuUsage.system, "microseconds");

// Measure CPU usage over an operation
const startUsage = process.cpuUsage();

// Do some work
let sum = 0;
for (let i = 0; i < 1000000; i++) {
  sum += i;
}

const diff = process.cpuUsage(startUsage);
console.log("\n  CPU used for calculation:");
console.log("    User:", diff.user, "microseconds");
console.log("    System:", diff.system, "microseconds");

console.log();

// ============================================
// 5. Process Working Directory
// ============================================

console.log("5. Working Directory:");

console.log("  Current directory:", process.cwd());

// You can change the working directory
const originalDir = process.cwd();

try {
  process.chdir("..");
  console.log("  Changed to parent:", process.cwd());

  // Change back
  process.chdir(originalDir);
  console.log("  Changed back:", process.cwd());
} catch (error) {
  console.log("  ✗ Error changing directory:", error.message);
}

console.log();

// ============================================
// 6. Process Exit Codes
// ============================================

console.log("6. Exit Codes:");

console.log("  Common exit codes:");
console.log("    0 = Success (default)");
console.log("    1 = Uncaught fatal exception");
console.log("    2 = Misuse of shell builtins");
console.log("    3 = Internal JavaScript parse error");
console.log("    9 = Invalid argument");
console.log("    130 = Script terminated by Ctrl+C");

console.log("\n  Current exit code:", process.exitCode || 0);

// Set custom exit code (don't call process.exit() yet!)
// process.exitCode = 1; // Uncomment to set exit code to 1

console.log();

// ============================================
// 7. Process Title
// ============================================

console.log("7. Process Title (visible in 'ps' or Task Manager):");

console.log("  Original title:", process.title);

// Change the process title
process.title = "my-awesome-node-app";
console.log("  New title:", process.title);

console.log("\n  ℹ️  Check with: ps aux | grep node");
console.log("  (or Task Manager on Windows)");

// Reset title
process.title = "node";

console.log();

// ============================================
// 8. Process Standard Streams
// ============================================

console.log("8. Standard I/O Streams:");

console.log("  stdin (input):", process.stdin.isTTY ? "TTY" : "Pipe");
console.log("  stdout (output):", process.stdout.isTTY ? "TTY" : "Pipe");
console.log("  stderr (errors):", process.stderr.isTTY ? "TTY" : "Pipe");

// Writing to stderr
process.stderr.write("  This is an error message!\n");

console.log();

// ============================================
// 9. Process Resource Usage (detailed)
// ============================================

console.log("9. Resource Usage:");

const usage = process.resourceUsage();

console.log("  User CPU time:", usage.userCPUTime, "µs");
console.log("  System CPU time:", usage.systemCPUTime, "µs");
console.log("  Max RSS:", formatBytes(usage.maxRSS * 1024));
console.log("  Page faults:", usage.minorPageFault);
console.log("  Context switches (voluntary):", usage.voluntaryContextSwitches);
console.log(
  "  Context switches (involuntary):",
  usage.involuntaryContextSwitches
);

console.log();

// ============================================
// 10. Process Features & Capabilities
// ============================================

console.log("10. Node.js Features:");

console.log("  Features:", process.features);
console.log("  Has IPv6:", process.features.ipv6);
console.log("  Has TLS:", process.features.tls_sni || process.features.tls);

console.log("\n=== Key Takeaways ===");
console.log("✓ process.pid, process.platform, process.arch - system info");
console.log("✓ process.argv - command line arguments");
console.log("✓ process.env - environment variables (next example!)");
console.log("✓ process.memoryUsage() - track memory consumption");
console.log("✓ process.cwd() - current working directory");
console.log("✓ process.exit(code) - terminate the process");
console.log("✓ process.stdin/stdout/stderr - standard I/O streams");
console.log("✓ The process object is always available globally!");
