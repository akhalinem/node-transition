import { config } from "./config/environment";
import redisClient from "./config/redis";
import dbClient from "./config/database";
import app from "./app";

async function start() {
  await dbClient.connect();
  console.log("Connected to Database");
  await redisClient.connect();
  console.log("Connected to Redis");

  app.listen(config.port, () => {
    console.log(`Server is running on http://localhost:${config.port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
