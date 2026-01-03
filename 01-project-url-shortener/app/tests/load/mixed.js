/**
 * Mixed Workload Test
 * Tests realistic mix of reads and writes
 * 80% reads (redirects), 20% writes (URL creation)
 *
 * Run: k6 run tests/load/mixed.js
 */

import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 100 },
    { duration: "2m", target: 500 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    "http_req_duration{type:read}": ["p(95)<50"], // Reads should be fast
    "http_req_duration{type:write}": ["p(95)<200"], // Writes can be slower
    http_req_failed: ["rate<0.01"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export function setup() {
  // Create some initial URLs for reading
  const shortCodes = [];

  for (let i = 1; i <= 20; i++) {
    const alias = Math.random().toString(36).substring(2, 12);
    const response = http.post(
      `${BASE_URL}/api/shorten`,
      JSON.stringify({
        url: `https://example.com/mixed-${i}`,
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

  return { shortCodes };
}

export default function (data) {
  // 80% reads, 20% writes
  const isRead = Math.random() < 0.8;

  if (isRead) {
    // READ: Redirect request
    const shortCode =
      data.shortCodes[Math.floor(Math.random() * data.shortCodes.length)];

    const response = http.get(`${BASE_URL}/${shortCode}`, {
      redirects: 0,
      tags: { type: "read" },
    });

    check(response, {
      "read: status is 301": (r) => r.status === 301,
      "read: response time < 50ms": (r) => r.timings.duration < 50,
    });
  } else {
    // WRITE: Create new URL
    const uniqueAlias = Math.random().toString(36).substring(2, 12);

    const response = http.post(
      `${BASE_URL}/api/shorten`,
      JSON.stringify({
        url: `https://example.com/dynamic-${Date.now()}`,
        customAlias: uniqueAlias,
      }),
      {
        headers: { "Content-Type": "application/json" },
        tags: { type: "write" },
      }
    );

    check(response, {
      "write: status is 201": (r) => r.status === 201,
      "write: response time < 200ms": (r) => r.timings.duration < 200,
    });
  }

  sleep(0.5);
}

export function teardown(data) {
  console.log(`\nTested with ${data.shortCodes.length} base URLs`);
  console.log("Mixed workload: 80% reads, 20% writes");
}
