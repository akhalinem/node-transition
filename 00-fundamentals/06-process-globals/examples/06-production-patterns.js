/**
 * 06 - Production Patterns
 *
 * Real-world patterns for process management in production applications.
 * These are patterns you'll use in every production Node.js app.
 */

console.log("=== Production Process Patterns ===\n");

// ============================================
// 1. Configuration Management
// ============================================

console.log("1. Production Configuration Pattern:");

class Config {
  constructor() {
    this.validate();
  }

  // Database configuration
  get database() {
    return {
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432", 10),
      name: process.env.DB_NAME || "myapp",
      user: process.env.DB_USER || "postgres",
      password: this.required("DB_PASSWORD"),
      pool: {
        min: parseInt(process.env.DB_POOL_MIN || "2", 10),
        max: parseInt(process.env.DB_POOL_MAX || "10", 10),
      },
      ssl: process.env.NODE_ENV === "production",
    };
  }

  // Redis configuration
  get redis() {
    return {
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379", 10),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || "0", 10),
    };
  }

  // Server configuration
  get server() {
    return {
      port: parseInt(process.env.PORT || "3000", 10),
      host: process.env.HOST || "0.0.0.0",
      env: process.env.NODE_ENV || "development",
    };
  }

  // Feature flags
  get features() {
    return {
      newUI: process.env.FEATURE_NEW_UI === "true",
      analytics: process.env.FEATURE_ANALYTICS !== "false", // On by default
      betaAPI: process.env.FEATURE_BETA_API === "true",
    };
  }

  // Required environment variable
  required(name) {
    const value = process.env[name];
    if (!value) {
      throw new Error(
        `Missing required environment variable: ${name}\n` +
          `Please set it before starting the application.\n` +
          `Example: ${name}=your_value node app.js`
      );
    }
    return value;
  }

  // Validate all configuration
  validate() {
    try {
      // Test all required values
      if (process.env.NODE_ENV === "production") {
        this.required("DB_PASSWORD");
        // Add other production requirements
      }

      // Validate port range
      const port = this.server.port;
      if (port < 1 || port > 65535) {
        throw new Error(`Invalid PORT: ${port}`);
      }

      console.log("  ✓ Configuration valid");
    } catch (error) {
      console.error("  ❌ Configuration error:", error.message);
      process.exit(1);
    }
  }

  // Safe logging (mask secrets)
  toString() {
    return JSON.stringify(
      {
        database: {
          ...this.database,
          password: "***",
        },
        redis: {
          ...this.redis,
          password: this.redis.password ? "***" : undefined,
        },
        server: this.server,
        features: this.features,
      },
      null,
      2
    );
  }
}

// Usage
try {
  const config = new Config();
  console.log("  Configuration loaded:");
  console.log(config.toString());
} catch (error) {
  console.error("  Failed to load config:", error.message);
}

console.log();

// ============================================
// 2. Health Check Endpoint Pattern
// ============================================

console.log("2. Health Check Pattern:");

class HealthCheck {
  constructor(dependencies) {
    this.dependencies = dependencies; // { db, redis, etc. }
    this.startTime = Date.now();
  }

  // Overall health status
  async check() {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkMemory(),
      this.checkEventLoop(),
    ]);

    const results = checks.map((result, index) => {
      const names = ["database", "redis", "memory", "eventLoop"];
      return {
        name: names[index],
        status: result.status === "fulfilled" ? "healthy" : "unhealthy",
        details: result.value || result.reason?.message,
      };
    });

    const allHealthy = results.every((r) => r.status === "healthy");

    return {
      status: allHealthy ? "healthy" : "unhealthy",
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      timestamp: new Date().toISOString(),
      checks: results,
    };
  }

  async checkDatabase() {
    // Simulate database check
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ connected: true, latency: 5 });
      }, 100);
    });
  }

  async checkRedis() {
    // Simulate Redis check
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ connected: true, latency: 2 });
      }, 50);
    });
  }

  async checkMemory() {
    const usage = process.memoryUsage();
    const heapUsedPercent = (usage.heapUsed / usage.heapTotal) * 100;

    if (heapUsedPercent > 90) {
      throw new Error(`High memory usage: ${heapUsedPercent.toFixed(2)}%`);
    }

    return {
      heapUsed: Math.floor(usage.heapUsed / 1024 / 1024),
      heapTotal: Math.floor(usage.heapTotal / 1024 / 1024),
      percentage: heapUsedPercent.toFixed(2),
    };
  }

  async checkEventLoop() {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      setImmediate(() => {
        const lag = Date.now() - start;
        if (lag > 100) {
          reject(new Error(`High event loop lag: ${lag}ms`));
        } else {
          resolve({ lag });
        }
      });
    });
  }
}

// Test health check
const healthCheck = new HealthCheck({});
healthCheck
  .check()
  .then((health) => {
    console.log("  Health check result:");
    console.log(JSON.stringify(health, null, 2));
  })
  .catch((error) => {
    console.error("  Health check failed:", error);
  });

setTimeout(() => {
  console.log();
}, 500);

// ============================================
// 3. Metrics Collection Pattern
// ============================================

setTimeout(() => {
  console.log("3. Metrics Collection Pattern:");

  class MetricsCollector {
    constructor() {
      this.metrics = new Map();
      this.startTime = Date.now();
    }

    // Increment a counter
    increment(name, value = 1, labels = {}) {
      const key = this.getKey(name, labels);
      const current = this.metrics.get(key) || { type: "counter", value: 0 };
      current.value += value;
      this.metrics.set(key, current);
    }

    // Set a gauge value
    gauge(name, value, labels = {}) {
      const key = this.getKey(name, labels);
      this.metrics.set(key, { type: "gauge", value });
    }

    // Record a histogram value
    histogram(name, value, labels = {}) {
      const key = this.getKey(name, labels);
      const current = this.metrics.get(key) || {
        type: "histogram",
        values: [],
      };
      current.values.push(value);
      this.metrics.set(key, current);
    }

    // Start a timer
    startTimer(name, labels = {}) {
      const start = process.hrtime.bigint();
      return () => {
        const duration = Number(process.hrtime.bigint() - start) / 1e6; // Convert to ms
        this.histogram(name, duration, labels);
      };
    }

    // Get key for metric + labels
    getKey(name, labels = {}) {
      const labelStr = Object.entries(labels)
        .map(([k, v]) => `${k}="${v}"`)
        .join(",");
      return labelStr ? `${name}{${labelStr}}` : name;
    }

    // Collect process metrics
    collectProcessMetrics() {
      const mem = process.memoryUsage();

      this.gauge("process_heap_bytes", mem.heapUsed);
      this.gauge("process_rss_bytes", mem.rss);
      this.gauge("process_uptime_seconds", Math.floor(process.uptime()));

      const cpu = process.cpuUsage();
      this.gauge("process_cpu_user_seconds_total", cpu.user / 1e6);
      this.gauge("process_cpu_system_seconds_total", cpu.system / 1e6);
    }

    // Export in Prometheus format
    exportPrometheus() {
      this.collectProcessMetrics();

      const lines = [];
      for (const [key, metric] of this.metrics) {
        if (metric.type === "histogram") {
          const values = metric.values;
          const sum = values.reduce((a, b) => a + b, 0);
          lines.push(`${key}_sum ${sum}`);
          lines.push(`${key}_count ${values.length}`);
        } else {
          lines.push(`${key} ${metric.value}`);
        }
      }
      return lines.join("\n");
    }

    // Export in JSON format
    exportJSON() {
      this.collectProcessMetrics();

      const result = {};
      for (const [key, metric] of this.metrics) {
        if (metric.type === "histogram") {
          const values = metric.values;
          result[key] = {
            count: values.length,
            sum: values.reduce((a, b) => a + b, 0),
            avg: values.reduce((a, b) => a + b, 0) / values.length,
            min: Math.min(...values),
            max: Math.max(...values),
          };
        } else {
          result[key] = metric.value;
        }
      }
      return result;
    }
  }

  // Usage example
  const metrics = new MetricsCollector();

  // Simulate some metrics
  metrics.increment("http_requests_total", 1, { method: "GET", path: "/api" });
  metrics.increment("http_requests_total", 1, { method: "POST", path: "/api" });

  const timer = metrics.startTimer("http_request_duration_ms", {
    method: "GET",
  });
  setTimeout(() => {
    timer(); // Stop timer
  }, 50);

  setTimeout(() => {
    console.log("  Metrics (JSON format):");
    console.log(JSON.stringify(metrics.exportJSON(), null, 2));
    console.log();
  }, 200);
}, 500);

// ============================================
// 4. Production Signal Handlers
// ============================================

setTimeout(() => {
  console.log("4. Production Signal Handlers:");

  class ProductionApp {
    constructor() {
      this.isShuttingDown = false;
      this.setupSignalHandlers();
    }

    setupSignalHandlers() {
      // Graceful shutdown
      process.on("SIGTERM", () => this.gracefulShutdown("SIGTERM"));
      process.on("SIGINT", () => this.gracefulShutdown("SIGINT"));

      // Status dump (useful for debugging production)
      process.on("SIGUSR1", () => this.dumpStatus());

      // Reload configuration
      process.on("SIGUSR2", () => this.reloadConfig());

      // Handle errors
      process.on("uncaughtException", (error) => this.handleError(error));
      process.on("unhandledRejection", (reason) =>
        this.handleRejection(reason)
      );

      console.log("  ✓ Signal handlers installed");
      console.log(`  PID: ${process.pid}`);
      console.log("  Signals:");
      console.log("    SIGTERM / SIGINT → Graceful shutdown");
      console.log("    SIGUSR1 → Dump status");
      console.log("    SIGUSR2 → Reload config");
    }

    async gracefulShutdown(signal) {
      if (this.isShuttingDown) return;
      this.isShuttingDown = true;

      console.log(`\n  🛑 ${signal} received - shutting down gracefully...`);

      // Set timeout for forced exit
      const timeout = setTimeout(() => {
        console.error("  ⏰ Shutdown timeout - forcing exit!");
        process.exit(1);
      }, 10000);
      timeout.unref();

      try {
        // Your shutdown logic here
        console.log("  1️⃣  Stopping server...");
        await new Promise((resolve) => setTimeout(resolve, 500));

        console.log("  2️⃣  Closing connections...");
        await new Promise((resolve) => setTimeout(resolve, 500));

        console.log("  ✅ Shutdown complete");
        process.exit(0);
      } catch (error) {
        console.error("  ❌ Shutdown error:", error);
        process.exit(1);
      }
    }

    dumpStatus() {
      console.log("\n  📊 Status Dump:");
      console.log("  Uptime:", process.uptime().toFixed(2), "seconds");
      console.log("  Memory:", process.memoryUsage());
      console.log("  CPU:", process.cpuUsage());
      console.log("  PID:", process.pid);
      console.log();
    }

    reloadConfig() {
      console.log("\n  🔄 Reloading configuration...");
      // Load new config
      console.log("  ✓ Configuration reloaded");
      console.log();
    }

    handleError(error) {
      console.error("\n  ❌ Uncaught Exception:", error);
      console.error("  Stack:", error.stack);

      // In production, you might:
      // - Send to error tracking service
      // - Log to file
      // - Trigger alerts
      // - Then exit

      if (!this.isShuttingDown) {
        this.gracefulShutdown("uncaughtException");
      }
    }

    handleRejection(reason) {
      console.error("\n  ❌ Unhandled Rejection:", reason);

      // In production, you might:
      // - Send to error tracking service
      // - Log to file
      // - Trigger alerts

      if (!this.isShuttingDown) {
        this.gracefulShutdown("unhandledRejection");
      }
    }
  }

  // Initialize app
  const app = new ProductionApp();
  console.log();
}, 1000);

// ============================================
// 5. Process Monitoring
// ============================================

setTimeout(() => {
  console.log("5. Process Monitoring Pattern:");

  class ProcessMonitor {
    constructor(interval = 30000) {
      this.interval = interval;
      this.timer = null;
    }

    start() {
      console.log("  ✓ Process monitor started");

      this.timer = setInterval(() => {
        this.checkHealth();
      }, this.interval);

      // Don't keep process alive just for monitoring
      this.timer.unref();
    }

    checkHealth() {
      const mem = process.memoryUsage();
      const cpu = process.cpuUsage();

      const heapPercent = (mem.heapUsed / mem.heapTotal) * 100;

      // Warn if memory is high
      if (heapPercent > 80) {
        console.warn(`  ⚠️  High memory usage: ${heapPercent.toFixed(2)}%`);
      }

      // Log metrics (in production, send to monitoring service)
      const metrics = {
        timestamp: new Date().toISOString(),
        memory: {
          heapUsed: Math.floor(mem.heapUsed / 1024 / 1024),
          heapTotal: Math.floor(mem.heapTotal / 1024 / 1024),
          rss: Math.floor(mem.rss / 1024 / 1024),
        },
        uptime: Math.floor(process.uptime()),
      };

      // Uncomment to see periodic health checks
      // console.log('  Health:', metrics);
    }

    stop() {
      if (this.timer) {
        clearInterval(this.timer);
        console.log("  Process monitor stopped");
      }
    }
  }

  const monitor = new ProcessMonitor(5000);
  monitor.start();
}, 1500);

// ============================================
// Summary
// ============================================

setTimeout(() => {
  console.log("\n=== Production Patterns Summary ===\n");

  console.log("1. Configuration Management");
  console.log("   • Centralized config class");
  console.log("   • Validate at startup (fail fast)");
  console.log("   • Mask secrets in logs");
  console.log("   • Support multiple environments");

  console.log("\n2. Health Checks");
  console.log("   • Check all dependencies");
  console.log("   • Include memory and event loop");
  console.log("   • Return detailed status");
  console.log("   • Use for load balancer probes");

  console.log("\n3. Metrics Collection");
  console.log("   • Track counters, gauges, histograms");
  console.log("   • Export in standard formats");
  console.log("   • Include process metrics");
  console.log("   • Send to monitoring service");

  console.log("\n4. Signal Handlers");
  console.log("   • SIGTERM/SIGINT → Graceful shutdown");
  console.log("   • SIGUSR1 → Status dump");
  console.log("   • SIGUSR2 → Reload config");
  console.log("   • Always set shutdown timeout");

  console.log("\n5. Process Monitoring");
  console.log("   • Periodic health checks");
  console.log("   • Alert on high memory/CPU");
  console.log("   • Track trends over time");
  console.log("   • Detect resource leaks");

  console.log("\n💡 These patterns are used in every production Node.js app!");

  process.exit(0);
}, 2500);
