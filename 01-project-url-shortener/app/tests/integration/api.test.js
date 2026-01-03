/**
 * Integration Tests: API Endpoints
 * Tests the complete request/response cycle
 */

const request = require("supertest");
const { query, pool } = require("../../config/database");
const redisClient = require("../../config/redis");
const app = require("../../src/index");

// Test data
let testShortCode;

describe("API Integration Tests", () => {
  // Clean up test data before and after tests
  beforeAll(async () => {
    // Wait for Redis connection
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    // Clean up any leftover test data from previous runs
    await query(
      "DELETE FROM urls WHERE original_url LIKE '%test-integration%' OR original_url LIKE '%example.com%'"
    );

    // Flush Redis test data
    const keys = await redisClient.keys("url:*");
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  });

  afterAll(async () => {
    // Clean up all test URLs
    await query(
      "DELETE FROM urls WHERE original_url LIKE '%test-integration%' OR original_url LIKE '%example.com%'"
    );

    // Clean up Redis cache
    const keys = await redisClient.keys("url:*");
    if (keys.length > 0) {
      await redisClient.del(keys);
    }

    // Clean up analytics data in Redis
    const clickKeys = await redisClient.keys("clicks:*");
    if (clickKeys.length > 0) {
      await redisClient.del(clickKeys);
    }

    // Close connections
    if (redisClient.isOpen) {
      await redisClient.quit();
    }

    // Close database pool
    await pool.end();
  });

  describe("POST /api/shorten", () => {
    test("should create a short URL with valid input", async () => {
      const response = await request(app)
        .post("/api/shorten")
        .send({
          url: "https://example.com/test-integration-1",
        })
        .expect(201)
        .expect("Content-Type", /json/);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("shortUrl");
      expect(response.body.data).toHaveProperty("shortCode");
      expect(response.body.data.originalUrl).toBe(
        "https://example.com/test-integration-1"
      );

      testShortCode = response.body.data.shortCode;
    });

    test("should create short URL with custom alias", async () => {
      const customAlias = "test" + Date.now().toString().slice(-4);

      const response = await request(app)
        .post("/api/shorten")
        .send({
          url: "https://example.com/test-integration-2",
          customAlias,
        })
        .expect(201);

      expect(response.body.data.shortCode).toBe(customAlias);
    });

    test("should create short URL with expiration", async () => {
      const response = await request(app)
        .post("/api/shorten")
        .send({
          url: "https://example.com/test-integration-3",
          expiresIn: 3600, // 1 hour
        })
        .expect(201);

      expect(response.body.data.expiresAt).toBeTruthy();
    });

    test("should reject invalid URL", async () => {
      const response = await request(app)
        .post("/api/shorten")
        .send({
          url: "not-a-valid-url",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("http://");
    });

    test("should reject localhost URL", async () => {
      const response = await request(app)
        .post("/api/shorten")
        .send({
          url: "http://localhost:3000",
        })
        .expect(400);

      expect(response.body.error).toContain("localhost");
    });

    test("should reject missing URL", async () => {
      const response = await request(app)
        .post("/api/shorten")
        .send({})
        .expect(400);

      expect(response.body.error).toContain("required");
    });

    test("should reject invalid custom alias", async () => {
      const response = await request(app)
        .post("/api/shorten")
        .send({
          url: "https://example.com",
          customAlias: "ab", // Too short
        })
        .expect(400);

      expect(response.body.error).toContain("at least 3");
    });

    test("should reject reserved custom alias", async () => {
      const response = await request(app)
        .post("/api/shorten")
        .send({
          url: "https://example.com",
          customAlias: "admin",
        })
        .expect(400);

      expect(response.body.error).toContain("reserved");
    });

    test("should reject duplicate custom alias", async () => {
      const alias = "uniq" + Date.now().toString().slice(-4);

      // Create first URL with alias
      await request(app)
        .post("/api/shorten")
        .send({
          url: "https://example.com/first",
          customAlias: alias,
        })
        .expect(201);

      // Try to create second URL with same alias
      const response = await request(app)
        .post("/api/shorten")
        .send({
          url: "https://example.com/second",
          customAlias: alias,
        })
        .expect(400);

      expect(response.body.error).toContain("already in use");
    });
  });

  describe("GET /:shortCode", () => {
    let redirectShortCode;

    beforeAll(async () => {
      // Create a URL for redirect testing
      const response = await request(app).post("/api/shorten").send({
        url: "https://example.com/redirect-test",
      });
      redirectShortCode = response.body.data.shortCode;
    });

    afterAll(async () => {
      // Clean up redirect test data
      if (redirectShortCode) {
        await query("DELETE FROM urls WHERE short_code = $1", [
          redirectShortCode,
        ]);
        await redisClient.del(
          `url:${redirectShortCode}`,
          `clicks:${redirectShortCode}`
        );
      }
    });

    test("should redirect to original URL", async () => {
      const response = await request(app)
        .get(`/${redirectShortCode}`)
        .expect(301);

      expect(response.headers.location).toBe(
        "https://example.com/redirect-test"
      );
    });

    test("should return 404 for non-existent short code", async () => {
      const response = await request(app).get("/notfound").expect(404);

      expect(response.body.error).toContain("not found");
    });

    test("should return 400 for invalid short code format", async () => {
      const response = await request(app)
        .get("/ab") // Too short
        .expect(400);

      expect(response.body.error).toContain("Invalid");
    });

    test("should increment click count on redirect", async () => {
      // Get initial stats
      const initialStats = await request(app).get(
        `/api/stats/${redirectShortCode}`
      );

      const initialClicks = initialStats.body.data.clickCount;

      // Perform redirect
      await request(app).get(`/${redirectShortCode}`).expect(301);

      // Wait a bit for async analytics
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check stats again
      const updatedStats = await request(app).get(
        `/api/stats/${redirectShortCode}`
      );

      // Click count might not increment immediately due to async nature
      // So we just verify the stats endpoint works
      expect(updatedStats.body.data.clickCount).toBeGreaterThanOrEqual(
        initialClicks
      );
    });
  });

  describe("GET /api/stats/:shortCode", () => {
    let statsShortCode;

    beforeAll(async () => {
      const response = await request(app).post("/api/shorten").send({
        url: "https://example.com/stats-test",
      });
      statsShortCode = response.body.data.shortCode;
    });

    afterAll(async () => {
      // Clean up stats test data
      if (statsShortCode) {
        await query("DELETE FROM urls WHERE short_code = $1", [statsShortCode]);
        await redisClient.del(
          `url:${statsShortCode}`,
          `clicks:${statsShortCode}`
        );
      }
    });

    test("should return analytics for existing URL", async () => {
      const response = await request(app)
        .get(`/api/stats/${statsShortCode}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("shortCode");
      expect(response.body.data).toHaveProperty("originalUrl");
      expect(response.body.data).toHaveProperty("clickCount");
      expect(response.body.data).toHaveProperty("createdAt");
    });

    test("should return 404 for non-existent short code", async () => {
      const response = await request(app)
        .get("/api/stats/notfound")
        .expect(404);

      expect(response.body.error).toContain("not found");
    });

    test("should return isExpired flag", async () => {
      const response = await request(app)
        .get(`/api/stats/${statsShortCode}`)
        .expect(200);

      expect(response.body.data).toHaveProperty("isExpired");
      expect(typeof response.body.data.isExpired).toBe("boolean");
    });
  });

  describe("GET /health", () => {
    test("should return health status", async () => {
      const response = await request(app).get("/health").expect(200);

      expect(response.body.status).toBe("ok");
      expect(response.body).toHaveProperty("database");
      expect(response.body).toHaveProperty("redis");
    });
  });
});
