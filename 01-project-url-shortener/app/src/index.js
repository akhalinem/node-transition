require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const express = require("express");
const apiRoutes = require("./routes/api");
const redirectRoutes = require("./routes/redirect");
const analyticsService = require("./services/analyticsService");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoint (MUST be before redirect routes)
app.get("/health", async (req, res) => {
  const redisClient = require("../config/redis");
  const { query } = require("../config/database");

  try {
    // Check database
    await query("SELECT 1");
    const dbStatus = "connected";

    // Check Redis
    const redisStatus = redisClient.isOpen ? "connected" : "disconnected";

    res.json({
      status: "ok",
      database: dbStatus,
      redis: redisStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status: "error",
      database: "error",
      redis: "unknown",
      error: err.message,
    });
  }
});

// Routes
app.use("/api", apiRoutes);
app.use("/", redirectRoutes); // This catches ALL remaining GET requests

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

// Start server only if not in test mode
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);

    // Start periodic analytics flush (every 10 seconds)
    analyticsService.startPeriodicFlush(10000);
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    console.log("SIGTERM received, closing server gracefully...");
    process.exit(0);
  });

  process.on("SIGINT", () => {
    console.log("SIGINT received, closing server gracefully...");
    process.exit(0);
  });
}

// Export app for testing
module.exports = app;
