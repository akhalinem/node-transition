/**
 * Stress Test - 1000 req/sec Target
 * Tests if the application can handle 1000 requests per second
 * with sub-50ms response times
 *
 * Run: k6 run tests/load/stress.js
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

// Custom metrics
const errorRate = new Rate("errors");
const redirectDuration = new Trend("redirect_duration");

export const options = {
  stages: [
    { duration: "30s", target: 100 }, // Warm up: 100 users
    { duration: "1m", target: 500 }, // Ramp up to 500 users
    { duration: "2m", target: 1000 }, // Ramp up to 1000 users (target!)
    { duration: "3m", target: 1000 }, // Stay at 1000 users for 3 minutes
    { duration: "1m", target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<50"], // 95% under 50ms (our goal!)
    http_req_duration: ["p(99)<100"], // 99% under 100ms
    http_req_failed: ["rate<0.01"], // Less than 1% errors
    errors: ["rate<0.01"], // Custom error rate
    redirect_duration: ["p(95)<50"], // Custom metric
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

// Setup: Create multiple short URLs for testing
export function setup() {
  const shortCodes = [];

  // Create 10 different URLs to distribute load
  for (let i = 1; i <= 10; i++) {
    const alias = Math.random().toString(36).substring(2, 12);
    const response = http.post(
      `${BASE_URL}/api/shorten`,
      JSON.stringify({
        url: `https://example.com/stress-test-${i}`,
        customAlias: alias,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (response.status === 201) {
      shortCodes.push(alias);
    }
  }

  console.log(`Created ${shortCodes.length} URLs for testing`);
  return { shortCodes };
}

// Main test function - runs for each virtual user
export default function (data) {
  // Pick a random short code from our pool
  const shortCode =
    data.shortCodes[Math.floor(Math.random() * data.shortCodes.length)];

  // Test redirect
  const response = http.get(`${BASE_URL}/${shortCode}`, {
    redirects: 0,
    tags: { name: "redirect" },
  });

  // Record custom metrics
  redirectDuration.add(response.timings.duration);
  errorRate.add(response.status !== 301);

  // Validate response
  const success = check(response, {
    "status is 301": (r) => r.status === 301,
    "has location header": (r) => r.headers["Location"] !== undefined,
    "response time < 50ms": (r) => r.timings.duration < 50,
  });

  if (!success) {
    console.error(
      `Failed request: ${response.status}, duration: ${response.timings.duration}ms`
    );
  }

  // Small sleep to simulate real user behavior
  sleep(0.1); // 100ms between requests per user
}

// Teardown: Show final statistics
export function teardown(data) {
  console.log("\n=== STRESS TEST COMPLETE ===");
  console.log(`Tested with ${data.shortCodes.length} URLs`);

  // Get stats for one of the URLs
  if (data.shortCodes.length > 0) {
    const statsResponse = http.get(
      `${BASE_URL}/api/stats/${data.shortCodes[0]}`
    );
    console.log("Sample URL stats:", statsResponse.body);
  }
}
