import { config } from "./config/environment";
import redisClient from "./config/redis";
import dbClient from "./config/database";
import app from "./app";
import { createWebSocketServer } from "./websocket/server";
import logger from "./utils/logger";

let isShuttingDown = false;

async function start() {
  try {
    logger.info("Starting chat application", { env: config.env });

    // Connect to database
    await dbClient.connect();
    logger.info("Database connected");

    // Connect to Redis
    await redisClient.connect();
    logger.info("Redis connected");

    // Start WebSocket server
    const wsServer = createWebSocketServer();
    logger.info("WebSocket server started");

    // Start HTTP server
    const server = app.listen(config.port, () => {
      logger.info("Server running", {
        url: `http://localhost:${config.port}`,
        wsUrl: `ws://localhost:${config.wsPort}`,
      });
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      if (isShuttingDown) return;
      isShuttingDown = true;

      logger.info(`Received ${signal}, gracefully shutting down...`);

      // Stop accepting new connections
      server.close(() => {
        logger.info("HTTP server closed");
      });
      wsServer.close(() => {
        logger.info("WebSocket server closed");
      });

      // Close database connection
      try {
        await dbClient.end();
        logger.info("Database connection closed");
      } catch (error) {
        logger.error("Error closing database connection:", error);
      }

      // Close Redis connection
      try {
        await redisClient.quit();
        logger.info("Redis connection closed");
      } catch (error) {
        logger.error("Error closing Redis connection:", error);
      }

      process.exit(0);
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      logger.error("Uncaught Exception:", error);
      process.exit(1);
    });

    process.on("unhandledRejection", (reason, promise) => {
      logger.error("Unhandled rejection", { reason, promise });
      process.exit(1);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();
