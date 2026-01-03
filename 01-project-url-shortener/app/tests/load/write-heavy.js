/**
 * Write Performance Test
 * Tests POST /api/shorten endpoint performance
 *
 * Run: k6 run tests/load/write-heavy.js
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { SharedArray } from "k6/data";

// Generate unique URLs for each iteration
const urls = new SharedArray("urls", function () {
  const urlList = [];
  for (let i = 0; i < 10000; i++) {
    urlList.push(`https://example.com/page-${i}`);
  }
  return urlList;
});

export const options = {
  stages: [
    { duration: "30s", target: 50 },
    { duration: "1m", target: 100 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<200"], // Write operations are slower
    http_req_failed: ["rate<0.01"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export default function () {
  // Pick a URL from our pool
  const url = urls[Math.floor(Math.random() * urls.length)];

  // Create a unique alias for each request
  const uniqueAlias = Math.random().toString(36).substring(2, 12);

  const response = http.post(
    `${BASE_URL}/api/shorten`,
    JSON.stringify({
      url: url,
      customAlias: uniqueAlias,
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  const success = check(response, {
    "status is 201": (r) => r.status === 201,
    "has shortCode": (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data && body.data.shortCode;
      } catch {
        return false;
      }
    },
    "response time < 200ms": (r) => r.timings.duration < 200,
  });

  if (!success) {
    console.error(`Failed to create URL: ${response.status}, ${response.body}`);
  }

  sleep(1);
}
