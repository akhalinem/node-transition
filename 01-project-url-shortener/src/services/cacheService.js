const redisClient = require("../config/redis");
const { query } = require("../config/database");

/**
 * URL Cache Service
 * Caches URL lookups in Redis for blazing fast redirects
 */

class CacheService {
  constructor() {
    this.defaultTTL = 3600; // 1 hour cache
  }

  /**
   * Get URL from cache or database
   * @param {string} shortCode - Short code to look up
   * @returns {Object|null} URL object or null
   */
  async getUrl(shortCode) {
    try {
      // Try cache first
      const cacheKey = `url:${shortCode}`;
      const cached = await redisClient.get(cacheKey);

      if (cached) {
        // Cache HIT! 🎯
        return JSON.parse(cached);
      }

      // Cache MISS - query database
      const result = await query("SELECT * FROM urls WHERE short_code = $1", [
        shortCode,
      ]);

      if (result.rows.length === 0) {
        // URL not found - cache the negative result to prevent DB hammering
        await redisClient.setEx(cacheKey, 60, JSON.stringify(null));
        return null;
      }

      const urlObject = result.rows[0];

      // Store in cache for future requests
      await redisClient.setEx(
        cacheKey,
        this.defaultTTL,
        JSON.stringify(urlObject)
      );

      return urlObject;
    } catch (err) {
      console.error("Cache error:", err);
      // Fallback to database on cache error
      const result = await query("SELECT * FROM urls WHERE short_code = $1", [
        shortCode,
      ]);
      return result.rows[0] || null;
    }
  }

  /**
   * Invalidate cache for a short code
   * Call this when URL is updated or deleted
   * @param {string} shortCode - Short code to invalidate
   */
  async invalidate(shortCode) {
    try {
      await redisClient.del(`url:${shortCode}`);
    } catch (err) {
      console.error("Error invalidating cache:", err);
    }
  }

  /**
   * Cache a URL object
   * @param {string} shortCode - Short code
   * @param {Object} urlObject - URL data to cache
   */
  async set(shortCode, urlObject) {
    try {
      await redisClient.setEx(
        `url:${shortCode}`,
        this.defaultTTL,
        JSON.stringify(urlObject)
      );
    } catch (err) {
      console.error("Error setting cache:", err);
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  async getStats() {
    try {
      const info = await redisClient.info("stats");
      // Parse Redis INFO output
      const lines = info.split("\r\n");
      const stats = {};

      lines.forEach((line) => {
        if (line.includes(":")) {
          const [key, value] = line.split(":");
          stats[key] = value;
        }
      });

      return {
        totalConnections: stats.total_connections_received || "N/A",
        totalCommands: stats.total_commands_processed || "N/A",
        cacheHits: stats.keyspace_hits || "0",
        cacheMisses: stats.keyspace_misses || "0",
        hitRate:
          stats.keyspace_hits && stats.keyspace_misses
            ? (
                (parseInt(stats.keyspace_hits) /
                  (parseInt(stats.keyspace_hits) +
                    parseInt(stats.keyspace_misses))) *
                100
              ).toFixed(2) + "%"
            : "N/A",
      };
    } catch (err) {
      console.error("Error getting cache stats:", err);
      return {};
    }
  }
}

module.exports = new CacheService();
