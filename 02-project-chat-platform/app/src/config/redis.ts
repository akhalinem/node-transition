import { createClient } from "redis";
import { config } from "./environment";

export const redisClient = createClient({
  socket: {
    host: config.redis.host,
    port: config.redis.port,
  },
  password: config.redis.password,
});

redisClient.on("connect", () => {
  console.log("✅ Redis connected");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

redisClient.on("ready", () => {
  console.log("✅ Redis is ready");
});

export default redisClient;
