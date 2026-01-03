/**
 * Baseline Load Test
 * Tests basic redirect performance under light load
 *
 * Run: k6 run tests/load/baseline.js
 */

import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 50 }, // Ramp up to 50 users
    { duration: "1m", target: 50 }, // Stay at 50 users
    { duration: "30s", target: 0 }, // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ["p(95)<100"], // 95% of requests should be below 100ms
    http_req_failed: ["rate<0.01"], // Less than 1% errors
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

// Setup: Create a short URL to test with
export function setup() {
  const alias = Math.random().toString(36).substring(2, 12);
  const createResponse = http.post(
    `${BASE_URL}/api/shorten`,
    JSON.stringify({
      url: "https://example.com/load-test",
      customAlias: alias,
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  check(createResponse, {
    "setup: URL created": (r) => r.status === 201,
  });

  return { shortCode: alias };
}

// Main test function
export default function (data) {
  // Test redirect performance
  const response = http.get(`${BASE_URL}/${data.shortCode}`, {
    redirects: 0, // Don't follow redirects, just measure response time
  });

  check(response, {
    "status is 301": (r) => r.status === 301,
    "has location header": (r) => r.headers["Location"] !== undefined,
    "response time < 50ms": (r) => r.timings.duration < 50,
  });

  sleep(1); // 1 second between iterations
}

// Cleanup: Get stats
export function teardown(data) {
  const statsResponse = http.get(`${BASE_URL}/api/stats/${data.shortCode}`);

  check(statsResponse, {
    "teardown: stats retrieved": (r) => r.status === 200,
  });

  console.log("Final stats:", statsResponse.body);
}
