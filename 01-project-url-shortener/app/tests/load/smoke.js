/**
 * Smoke Test
 * Quick sanity check before running larger tests
 *
 * Run: k6 run tests/load/smoke.js
 */

import http from "k6/http";
import { check, group } from "k6";

export const options = {
  vus: 1, // 1 virtual user
  iterations: 1, // Run once
  thresholds: {
    checks: ["rate>0.95"], // 95% of checks should pass
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export default function () {
  let shortCode;

  group("Health Check", function () {
    const response = http.get(`${BASE_URL}/health`);
    check(response, {
      "health check status is 200": (r) => r.status === 200,
      "database is connected": (r) => {
        const body = JSON.parse(r.body);
        return body.database === "connected";
      },
      "redis is connected": (r) => {
        const body = JSON.parse(r.body);
        return body.redis === "connected";
      },
    });
  });

  group("Create Short URL", function () {
    const response = http.post(
      `${BASE_URL}/api/shorten`,
      JSON.stringify({
        url: "https://example.com/smoke-test",
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    check(response, {
      "create status is 201": (r) => r.status === 201,
      "response has shortCode": (r) => {
        const body = JSON.parse(r.body);
        shortCode = body.data?.shortCode;
        return shortCode !== undefined;
      },
    });
  });

  group("Redirect", function () {
    if (shortCode) {
      const response = http.get(`${BASE_URL}/${shortCode}`, {
        redirects: 0,
      });

      check(response, {
        "redirect status is 301": (r) => r.status === 301,
        "has location header": (r) => r.headers["Location"] !== undefined,
        "response time < 50ms": (r) => r.timings.duration < 50,
      });
    }
  });

  group("Get Stats", function () {
    if (shortCode) {
      const response = http.get(`${BASE_URL}/api/stats/${shortCode}`);

      check(response, {
        "stats status is 200": (r) => r.status === 200,
        "has click count": (r) => {
          const body = JSON.parse(r.body);
          return body.data?.clickCount !== undefined;
        },
      });
    }
  });

  group("Error Handling", function () {
    const response = http.get(`${BASE_URL}/notfound`);
    check(response, {
      "not found returns 404": (r) => r.status === 404,
    });

    const badRequest = http.post(
      `${BASE_URL}/api/shorten`,
      JSON.stringify({
        url: "not-a-url",
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    check(badRequest, {
      "invalid URL returns 400": (r) => r.status === 400,
    });
  });
}
