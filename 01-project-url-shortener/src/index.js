require("dotenv").config();
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
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "URL Shortener is running",
    timestamp: new Date().toISOString(),
  });
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

// Start server
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
