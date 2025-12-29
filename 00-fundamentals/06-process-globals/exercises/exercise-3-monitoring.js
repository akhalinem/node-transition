/**
 * EXERCISE 3: Process Monitoring & Health Checks
 * Difficulty: ⭐⭐
 *
 * Build a process monitoring system that tracks health metrics
 * and responds to signals for debugging and status checks.
 */

console.log("=== Exercise 3: Process Monitoring ===\n");

// ============================================
// CHALLENGE 1: Health Monitor
// ============================================

console.log("Challenge 1: Process Health Monitor");
console.log("----------------------------------");

/**
 * Task: Create a HealthMonitor that:
 * - Tracks process metrics (CPU, memory, uptime)
 * - Monitors event loop lag
 * - Detects memory leaks
 * - Provides health status endpoint
 * - Responds to SIGUSR1 for status dump
 */

class HealthMonitor {
  constructor(options = {}) {
    this.checkInterval = options.checkInterval || 5000;
    this.eventLoopThreshold = options.eventLoopThreshold || 100; // ms
    this.memoryThreshold = options.memoryThreshold || 0.9; // 90%
    this.metrics = {
      eventLoopLag: [],
      memoryUsage: [],
      cpuUsage: [],
    };
    this.isHealthy = true;
    this.checkTimer = null;
  }

  start() {
    // TODO: Start monitoring
    // - Set up interval to collect metrics
    // - Check thresholds
    // - Update health status
    // - Set up SIGUSR1 handler for status dump
    throw new Error("Not implemented");
  }

  measureEventLoopLag() {
    // TODO: Measure event loop lag
    // Use setImmediate to measure delay
    // Compare expected vs actual time
    throw new Error("Not implemented");
  }

  checkMemory() {
    // TODO: Check memory usage
    // Get current memory usage
    // Compare with threshold
    // Track trend (increasing over time = leak?)
    throw new Error("Not implemented");
  }

  checkCPU() {
    // TODO: Check CPU usage
    // Use process.cpuUsage()
    // Calculate percentage
    throw new Error("Not implemented");
  }

  getHealth() {
    // TODO: Return current health status
    // Include all metrics
    // Overall health status
    throw new Error("Not implemented");
  }

  dumpStatus() {
    // TODO: Dump detailed status
    // Called on SIGUSR1
    // Log all metrics, memory, active handles, etc.
    throw new Error("Not implemented");
  }

  stop() {
    // TODO: Stop monitoring
    throw new Error("Not implemented");
  }
}

// Test your implementation
async function testChallenge1() {
  try {
    const monitor = new HealthMonitor({
      checkInterval: 2000,
      eventLoopThreshold: 50,
    });

    monitor.start();

    console.log("✓ Monitor started");
    console.log("  Collecting metrics...\n");

    // Simulate some load
    setTimeout(() => {
      // Block event loop briefly
      const start = Date.now();
      while (Date.now() - start < 100) {
        // Blocking operation
      }
    }, 3000);

    // Check health after a while
    setTimeout(() => {
      const health = monitor.getHealth();
      console.log("  Health status:", health);
      monitor.stop();
    }, 8000);

    console.log("  Send SIGUSR1 for status dump:");
    console.log(`    kill -USR1 ${process.pid}\n`);
  } catch (error) {
    console.log("✗ Test failed:", error.message);
  }
}

// Uncomment to test:
// testChallenge1();

// ============================================
// CHALLENGE 2: Process Inspector
// ============================================

setTimeout(() => {
  console.log("\nChallenge 2: Process Inspector");
  console.log("-----------------------------");

  /**
   * Task: Create a ProcessInspector that:
   * - Dumps process information on demand
   * - Shows memory breakdown
   * - Lists active handles and requests
   * - Shows environment variables (masked secrets)
   * - Generates heap snapshots
   * - Responds to custom signals
   */

  class ProcessInspector {
    constructor() {
      this.secretPatterns = [
        /password/i,
        /secret/i,
        /key/i,
        /token/i,
        /api[-_]?key/i,
      ];
    }

    inspect() {
      // TODO: Return comprehensive process information
      // - Process ID, parent ID
      // - Node.js version
      // - Platform, architecture
      // - Memory usage (detailed)
      // - CPU usage
      // - Uptime
      // - Resource usage
      throw new Error("Not implemented");
    }

    getMemoryBreakdown() {
      // TODO: Detailed memory breakdown
      // - Heap used/total
      // - External
      // - Array buffers
      // - RSS
      // - Calculate percentages
      throw new Error("Not implemented");
    }

    getActiveHandles() {
      // TODO: List active handles
      // Use process._getActiveHandles() if available
      // Categorize by type
      throw new Error("Not implemented");
    }

    getEnvironment(maskSecrets = true) {
      // TODO: Get environment variables
      // Mask any that match secret patterns
      throw new Error("Not implemented");
    }

    maskSecret(key, value) {
      // TODO: Mask a secret value
      // Check if key matches secret patterns
      // If yes, mask the value
      throw new Error("Not implemented");
    }

    takeHeapSnapshot(filename) {
      // TODO: Take a heap snapshot
      // Use v8.writeHeapSnapshot()
      // Return the filename
      throw new Error("Not implemented");
    }

    setupSignalHandlers() {
      // TODO: Set up signal handlers
      // SIGUSR1 - Dump basic info
      // SIGUSR2 - Take heap snapshot
      throw new Error("Not implemented");
    }
  }

  // Test your implementation
  async function testChallenge2() {
    try {
      const inspector = new ProcessInspector();

      console.log("\n✓ Process Information:");
      console.log(JSON.stringify(inspector.inspect(), null, 2));

      console.log("\n✓ Memory Breakdown:");
      console.log(JSON.stringify(inspector.getMemoryBreakdown(), null, 2));

      // Set a secret for testing
      process.env.API_SECRET_KEY = "super_secret_123";

      console.log("\n✓ Environment (masked):");
      const env = inspector.getEnvironment(true);
      console.log("  API_SECRET_KEY:", env.API_SECRET_KEY);

      inspector.setupSignalHandlers();
      console.log("\n✓ Signal handlers set up");
      console.log(`  kill -USR1 ${process.pid} (dump info)`);
      console.log(`  kill -USR2 ${process.pid} (heap snapshot)`);
    } catch (error) {
      console.log("✗ Test failed:", error.message);
    }
  }

  // Uncomment to test:
  // testChallenge2();
}, 100);

// ============================================
// CHALLENGE 3: Resource Leak Detector
// ============================================

setTimeout(() => {
  console.log("\nChallenge 3: Resource Leak Detector");
  console.log("----------------------------------");

  /**
   * Task: Create a LeakDetector that:
   * - Monitors memory growth over time
   * - Detects increasing handle/request counts
   * - Takes heap snapshots for comparison
   * - Alerts when potential leak detected
   * - Tracks specific resource types
   */

  class LeakDetector {
    constructor(options = {}) {
      this.sampleInterval = options.sampleInterval || 10000;
      this.samples = [];
      this.maxSamples = options.maxSamples || 10;
      this.growthThreshold = options.growthThreshold || 0.1; // 10%
      this.alerts = [];
    }

    start() {
      // TODO: Start monitoring for leaks
      // Collect samples periodically
      // Analyze trends
      throw new Error("Not implemented");
    }

    takeSample() {
      // TODO: Take a sample of current state
      // - Memory usage
      // - Handle count
      // - Request count
      // - Timestamp
      throw new Error("Not implemented");
    }

    analyzeTrend(metric) {
      // TODO: Analyze if metric is growing
      // Calculate growth rate
      // Compare with threshold
      // Return leak likelihood
      throw new Error("Not implemented");
    }

    detectLeaks() {
      // TODO: Check all metrics for leaks
      // - Memory growth
      // - Handle growth
      // - Request growth
      // Generate alerts if needed
      throw new Error("Not implemented");
    }

    getReport() {
      // TODO: Generate leak detection report
      // - Current metrics
      // - Trends
      // - Alerts
      // - Recommendations
      throw new Error("Not implemented");
    }

    stop() {
      // TODO: Stop monitoring
      throw new Error("Not implemented");
    }
  }

  // Simulate a memory leak for testing
  function createLeak() {
    const leakyArray = [];
    setInterval(() => {
      // This will cause a memory leak!
      leakyArray.push(new Array(1000).fill("leak"));
    }, 100);
  }

  // Test your implementation
  async function testChallenge3() {
    try {
      const detector = new LeakDetector({
        sampleInterval: 3000,
        maxSamples: 5,
        growthThreshold: 0.05,
      });

      detector.start();
      console.log("✓ Leak detector started\n");

      // Uncomment to create an intentional leak
      // console.log('  Creating memory leak...');
      // createLeak();

      // Check after some time
      setTimeout(() => {
        const report = detector.getReport();
        console.log("  Leak Detection Report:");
        console.log(JSON.stringify(report, null, 2));
        detector.stop();
      }, 16000);
    } catch (error) {
      console.log("✗ Test failed:", error.message);
    }
  }

  // Uncomment to test:
  // testChallenge3();
}, 200);

// ============================================
// CHALLENGE 4: Complete Monitoring Dashboard
// ============================================

setTimeout(() => {
  console.log("\nChallenge 4: Monitoring Dashboard");
  console.log("--------------------------------");

  /**
   * Task: Combine all monitoring into a dashboard:
   * - Health monitor
   * - Process inspector
   * - Leak detector
   * - HTTP endpoint for metrics
   * - Signal handlers for debugging
   * - Alerting system
   */

  class MonitoringDashboard {
    constructor(options = {}) {
      // TODO: Initialize all monitoring components
      // Create health monitor, inspector, leak detector
    }

    async start() {
      // TODO: Start all monitoring
      // Set up HTTP server for metrics
      // Set up signal handlers
    }

    handleMetricsRequest(req, res) {
      // TODO: Return metrics in JSON or Prometheus format
      throw new Error("Not implemented");
    }

    handleHealthRequest(req, res) {
      // TODO: Return health check
      throw new Error("Not implemented");
    }

    alert(message, level = "warning") {
      // TODO: Handle alerts
      // Log, send to external service, etc.
      throw new Error("Not implemented");
    }

    async stop() {
      // TODO: Stop all monitoring
      throw new Error("Not implemented");
    }
  }

  console.log("  ℹ️  Implement a complete monitoring dashboard");
  console.log("  Expose metrics at: http://localhost:9090/metrics");
  console.log("  Health check at: http://localhost:9090/health");
}, 300);

// ============================================
// GETTING STARTED
// ============================================

setTimeout(() => {
  console.log("\n=== Getting Started ===");
  console.log("1. Implement Challenge 1 (HealthMonitor)");
  console.log("2. Test event loop lag detection");
  console.log("3. Implement Challenge 2 (ProcessInspector)");
  console.log("4. Test signal handlers (SIGUSR1, SIGUSR2)");
  console.log("5. Implement Challenge 3 (LeakDetector)");
  console.log("6. Combine in Challenge 4 (Dashboard)");
  console.log("\n=== Solution ===");
  console.log("Compare with: exercise-3-solution.js");
}, 400);
