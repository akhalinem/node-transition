const redisClient = require("../config/redis");
const { query } = require("../config/database");

/**
 * Analytics Service
 * Handles click tracking with Redis buffering
 */

class AnalyticsService {
  /**
   * Track a click (fast - uses Redis)
   * @param {string} shortCode - Short code that was clicked
   */
  async trackClick(shortCode) {
    try {
      // Increment in Redis (super fast, in-memory)
      await redisClient.incr(`clicks:${shortCode}`);

      // Update last accessed timestamp in Redis
      await redisClient.set(
        `last_accessed:${shortCode}`,
        new Date().toISOString(),
        { EX: 3600 } // Expire after 1 hour
      );
    } catch (err) {
      console.error("Error tracking click in Redis:", err);
      // Don't throw - tracking shouldn't break redirects
    }
  }

  /**
   * Flush Redis click counts to PostgreSQL
   * Call this periodically (e.g., every 10 seconds)
   */
  async flushClicksToDatabase() {
    try {
      // Get all click keys from Redis
      const keys = await redisClient.keys("clicks:*");

      if (keys.length === 0) {
        return;
      }

      console.log(`📊 Flushing ${keys.length} click counters to database...`);

      for (const key of keys) {
        const shortCode = key.replace("clicks:", "");
        const clicks = await redisClient.get(key);

        if (clicks && parseInt(clicks) > 0) {
          // Update database
          await query(
            `UPDATE urls 
             SET click_count = click_count + $1,
                 last_accessed = CURRENT_TIMESTAMP
             WHERE short_code = $2`,
            [parseInt(clicks), shortCode]
          );

          // Delete the key from Redis after successful flush
          await redisClient.del(key);
        }
      }

      console.log(`✅ Successfully flushed click data`);
    } catch (err) {
      console.error("❌ Error flushing clicks to database:", err);
    }
  }

  /**
   * Start periodic flushing (call this when server starts)
   */
  startPeriodicFlush(intervalMs = 10000) {
    console.log(`🔄 Starting periodic click flush every ${intervalMs}ms`);

    // Flush immediately on start
    this.flushClicksToDatabase();

    // Then flush periodically
    setInterval(() => {
      this.flushClicksToDatabase();
    }, intervalMs);
  }
}

module.exports = new AnalyticsService();
