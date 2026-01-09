import { config } from "./config/environment";
import redisClient from "./config/redis";
import pool from "./database/pool";

async function start() {
  console.log("🚀 Starting Chat Platform Server...");
  console.log(`Environment: ${config.env}`);
  console.log(`Port: ${config.port}`);
  console.log(`WebSocket Port: ${config.wsPort}`);

  // Test database connection
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("✅ Database connected at:", result.rows[0].now);
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }

  // Test Redis connection
  try {
    await redisClient.connect();
    await redisClient.set("test_key", "test_value");
    const value = await redisClient.get("test_key");
    console.log("✅ Redis connected and working:", value);
  } catch (error) {
    console.error("❌ Redis connection failed:", error);
    process.exit(1);
  }
}

start();
