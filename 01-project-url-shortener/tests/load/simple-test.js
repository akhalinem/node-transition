import http from "k6/http";
import { check, sleep } from "k6";

// Simple constant load test
export const options = {
  vus: 100, // 100 virtual users
  duration: "30s", // Run for 30 seconds

  thresholds: {
    http_req_duration: ["p(95)<50"], // 95th percentile < 50ms
    http_req_failed: ["rate<0.01"], // Less than 1% failures
  },
};

export function setup() {
  // Create a test URL
  const res = http.post(
    "http://localhost:3000/api/shorten",
    JSON.stringify({
      url: "https://www.github.com",
      customAlias: "k6simple",
    }),
    { headers: { "Content-Type": "application/json" } }
  );

  console.log("Setup complete");
  return { shortCode: "k6simple" };
}

export default function (data) {
  // Test the redirect
  const res = http.get(`http://localhost:3000/${data.shortCode}`, {
    redirects: 0,
  });

  check(res, {
    "is status 301": (r) => r.status === 301,
    "is fast": (r) => r.timings.duration < 50,
  });

  sleep(0.1); // 100ms pause
}
