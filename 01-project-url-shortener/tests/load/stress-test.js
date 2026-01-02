import http from "k6/http";
import { check } from "k6";

// Stress test - gradually increase load until it breaks
export const options = {
  stages: [
    { duration: "1m", target: 100 }, // Warm up
    { duration: "2m", target: 500 }, // Increase to 500 req/sec
    { duration: "2m", target: 1000 }, // Push to 1000 req/sec
    { duration: "2m", target: 1500 }, // Stress test: 1500 req/sec
    { duration: "2m", target: 2000 }, // Stress test: 2000 req/sec
    { duration: "1m", target: 0 }, // Cool down
  ],

  thresholds: {
    http_req_duration: ["p(95)<100"], // More lenient for stress test
  },
};

export function setup() {
  const res = http.post(
    "http://localhost:3000/api/shorten",
    JSON.stringify({
      url: "https://www.example.com",
      customAlias: "k6stress",
    }),
    { headers: { "Content-Type": "application/json" } }
  );

  return { shortCode: "k6stress" };
}

export default function (data) {
  const res = http.get(`http://localhost:3000/${data.shortCode}`, {
    redirects: 0,
  });

  check(res, {
    "status is 301": (r) => r.status === 301,
  });
}
