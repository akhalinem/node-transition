/**
 * Spike Test
 * Tests how the system handles sudden traffic spikes
 * Simulates viral URL scenario (Reddit/Twitter spike)
 *
 * Run: k6 run tests/load/spike.js
 */

import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "10s", target: 100 }, // Normal load
    { duration: "10s", target: 2000 }, // SPIKE! 20x increase
    { duration: "30s", target: 2000 }, // Hold spike
    { duration: "10s", target: 100 }, // Back to normal
    { duration: "10s", target: 0 }, // Cool down
  ],
  thresholds: {
    http_req_duration: ["p(95)<200"], // More lenient during spike
    http_req_failed: ["rate<0.05"], // Allow 5% errors during spike
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export function setup() {
  const alias = Math.random().toString(36).substring(2, 12);
  const response = http.post(
    `${BASE_URL}/api/shorten`,
    JSON.stringify({
      url: "https://example.com/viral-content",
      customAlias: alias,
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  return { shortCode: alias };
}

export default function (data) {
  const response = http.get(`${BASE_URL}/${data.shortCode}`, {
    redirects: 0,
  });

  check(response, {
    "status is 301": (r) => r.status === 301,
    "response time < 200ms": (r) => r.timings.duration < 200,
  });

  sleep(0.05); // Very short sleep - high frequency
}

export function teardown(data) {
  const statsResponse = http.get(`${BASE_URL}/api/stats/${data.shortCode}`);
  console.log("Spike test stats:", statsResponse.body);
}
