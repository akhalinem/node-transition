const { Pool } = require("pg");

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "url_shortener",
  password: process.env.DB_PASSWORD || "postgres",
  port: process.env.DB_PORT || 5432,
  max: 50, // Increased from 20 to handle more concurrent requests
  min: 10, // Keep minimum connections ready
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, // Give more time if pool is busy
  acquireTimeoutMillis: 10000, // Max time to wait for a connection
});

// Test database connection
pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("❌ Unexpected database error:", err);
  process.exit(-1);
});

// Helper function to run queries
const query = (text, params) => pool.query(text, params);

module.exports = {
  pool,
  query,
};
