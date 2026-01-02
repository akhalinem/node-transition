import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

// Custom metrics
const errorRate = new Rate("errors");

// Test configuration
export const options = {
  // Scenario 1: Gradual ramp-up (realistic traffic pattern)
  stages: [
    { duration: "30s", target: 50 }, // Ramp up to 50 users over 30s
    { duration: "1m", target: 100 }, // Ramp up to 100 users over 1 min
    { duration: "2m", target: 100 }, // Stay at 100 users for 2 min
    { duration: "30s", target: 200 }, // Spike to 200 users
    { duration: "1m", target: 200 }, // Hold spike for 1 min
    { duration: "30s", target: 0 }, // Ramp down to 0
  ],

  // Thresholds (pass/fail criteria)
  thresholds: {
    http_req_duration: ["p(95)<50"], // 95% of requests must be < 50ms
    "http_req_duration{type:redirect}": ["p(95)<50"], // Redirects specifically
    errors: ["rate<0.01"], // Error rate < 1%
    http_req_failed: ["rate<0.01"], // Failed requests < 1%
  },
};

// Setup: Create a test URL before the test starts
export function setup() {
  const createUrl = "http://localhost:3000/api/shorten";
  const payload = JSON.stringify({
    url: "https://www.google.com",
    customAlias: "k6test",
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const res = http.post(createUrl, payload, params);

  if (res.status === 201 || res.status === 400) {
    // 400 might mean it already exists, which is fine
    console.log("✅ Test URL created or already exists");
    return { shortCode: "k6test" };
  } else {
    console.log(`⚠️ Setup warning: ${res.status}`);
    return { shortCode: "k6test" };
  }
}

// Main test function - runs for each virtual user
export default function (data) {
  const shortCode = data.shortCode;

  // Test redirect endpoint
  const res = http.get(`http://localhost:3000/${shortCode}`, {
    tags: { type: "redirect" },
    redirects: 0, // Don't follow redirects
  });

  // Verify response
  const success = check(res, {
    "status is 301": (r) => r.status === 301,
    "has Location header": (r) => r.headers["Location"] !== undefined,
    "response time < 50ms": (r) => r.timings.duration < 50,
  });

  // Track errors
  errorRate.add(!success);

  // Small random think time (simulating real user behavior)
  sleep(Math.random() * 0.5); // 0-500ms pause between requests
}

// Teardown: Optional cleanup after test
export function teardown(data) {
  console.log("✅ Load test completed!");
}
