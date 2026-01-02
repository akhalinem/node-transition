# k6 Load Testing Guide

## 🎯 What is k6?

k6 is a modern load testing tool designed for developers. It uses JavaScript and provides:

- Realistic traffic simulation
- Detailed performance metrics
- Pass/fail thresholds
- Beautiful CLI output

---

## 🚀 Running Tests

### 1. Simple Test (Start Here)

Tests basic functionality with constant load:

```bash
cd src
npm run load:simple
```

**What it does:**

- 100 virtual users
- 30 seconds duration
- Constant load
- Checks: p95 < 50ms, <1% errors

---

### 2. Realistic Test (Recommended)

Simulates real-world traffic patterns:

```bash
npm run load:realistic
```

**Traffic pattern:**

```
Users
  │
200 ┤        ┌────┐
    │       ╱      ╲
100 ┤    ┌─┘        ╲
    │   ╱            ╲
 50 ┤ ╱               ╲
    │╱                 ╲___
  0 └──────────────────────→ Time
    0   1   2   3   4   5  6min
```

**Stages:**

1. Warm-up: 0→50 users (30s)
2. Ramp-up: 50→100 users (1min)
3. Steady: 100 users (2min)
4. Spike: 100→200 users (30s)
5. Hold spike: 200 users (1min)
6. Cool down: 200→0 (30s)

---

### 3. Stress Test (Find Your Limits)

Pushes your server to the breaking point:

```bash
npm run load:stress
```

**What it does:**

- Gradually increases from 100 to 2000 req/sec
- Finds your performance ceiling
- Identifies bottlenecks
- Takes ~10 minutes

---

## 📊 Understanding k6 Output

### Live Metrics During Test:

```
     ✓ status is 301
     ✓ response time < 50ms

     checks.........................: 100.00% ✓ 2000 ✗ 0
     data_received..................: 156 kB  5.2 kB/s
     data_sent......................: 180 kB  6.0 kB/s
     http_req_duration..............: avg=3.21ms  p(95)=5.12ms
     http_req_failed................: 0.00%   ✓ 0    ✗ 2000
     http_reqs......................: 2000    66.67/s
     iteration_duration.............: avg=1.5s
     iterations.....................: 2000    66.67/s
     vus............................: 100
     vus_max........................: 100
```

### Key Metrics Explained:

**✓ checks**: Pass/fail validations

- `100%` = All requests passed validation

**http_req_duration**: Response time

- `avg` = Average response time
- `p(95)` = 95th percentile (most important!)
- `min/max` = Range

**http_req_failed**: Error rate

- `0.00%` = No errors (good!)
- `>1%` = Something's wrong

**http_reqs**: Total requests

- Shows requests/second achieved

**vus**: Virtual users

- Current number of concurrent users

---

## 🎯 Thresholds (Pass/Fail Criteria)

Thresholds determine if your test passes:

```javascript
thresholds: {
  'http_req_duration': ['p(95)<50'],  // 95% of requests < 50ms
  'http_req_failed': ['rate<0.01'],   // < 1% error rate
}
```

**Results:**

```
✓ http_req_duration........: avg=3.21ms  p(95)=5.12ms  ← PASS!
✗ http_req_duration........: avg=120ms   p(95)=150ms   ← FAIL!
```

---

## 📈 Expected Results

### Good Performance:

```
http_req_duration..............: avg=2-5ms    p(95)=5-10ms
http_req_failed................: 0.00%
http_reqs......................: 900-1000/s
```

### Warning Signs:

```
http_req_duration..............: avg=20ms+    p(95)=50ms+
http_req_failed................: >1%
http_reqs......................: <500/s
```

---

## 🔍 Analyzing Results

### Scenario 1: High Response Times

```
http_req_duration: avg=80ms p(95)=120ms
```

**Possible causes:**

- Database queries not cached
- Connection pool exhausted
- Slow queries
- No indexes

**Solutions:**

- Check Redis cache hit rate
- Increase connection pool
- Add database indexes
- Profile slow queries

---

### Scenario 2: High Error Rate

```
http_req_failed: 5.00% ✗ 250
```

**Possible causes:**

- Server crashing under load
- Connection timeouts
- Database errors

**Solutions:**

- Check server logs
- Monitor memory usage
- Check database connections

---

### Scenario 3: Low Throughput

```
http_reqs: 300/s (target: 1000/s)
```

**Possible causes:**

- CPU bottleneck
- Blocking operations
- Insufficient resources

**Solutions:**

- Use async operations
- Optimize code
- Scale horizontally

---

## 💡 Best Practices

### 1. Warm Up Redis Cache

Before running tests, hit the endpoint a few times:

```bash
curl http://localhost:3000/k6test
curl http://localhost:3000/k6test
curl http://localhost:3000/k6test
```

### 2. Monitor Server Resources

In another terminal:

```bash
# Watch server logs
npm run dev

# Monitor system resources
top
```

### 3. Incremental Testing

Don't jump straight to stress test:

1. ✅ Simple test first (verify it works)
2. ✅ Realistic test (verify performance)
3. ✅ Stress test (find limits)

### 4. Test Different Scenarios

Create tests for:

- Cache hits (same URL repeatedly)
- Cache misses (random URLs)
- Creating new URLs
- Getting statistics

---

## 🎓 Custom k6 Test Example

Create your own test:

```javascript
import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 50, // 50 concurrent users
  duration: "1m", // Run for 1 minute

  thresholds: {
    http_req_duration: ["p(95)<50"],
  },
};

export default function () {
  const res = http.get("http://localhost:3000/yourcode");

  check(res, {
    "is redirect": (r) => r.status === 301,
    "is fast": (r) => r.timings.duration < 50,
  });
}
```

Save as `tests/load/my-test.js` and run:

```bash
k6 run ../tests/load/my-test.js
```

---

## 📚 Advanced Features

### Custom Metrics

```javascript
import { Trend } from "k6/metrics";

const myTrend = new Trend("custom_metric");

export default function () {
  const start = Date.now();
  // ... do something ...
  myTrend.add(Date.now() - start);
}
```

### Scenarios (Multiple Test Patterns)

```javascript
export const options = {
  scenarios: {
    constant_load: {
      executor: "constant-vus",
      vus: 100,
      duration: "5m",
    },
    spike: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "10s", target: 1000 },
        { duration: "30s", target: 1000 },
      ],
      startTime: "5m", // Start after constant_load
    },
  },
};
```

### Export Results

```bash
k6 run --out json=results.json tests/load/simple-test.js
k6 run --out influxdb=http://localhost:8086/k6 tests/load/simple-test.js
```

---

## ✅ Success Criteria

Your URL shortener passes if:

- ✅ p95 < 50ms under 1000 req/sec
- ✅ Error rate < 1%
- ✅ No timeouts
- ✅ Consistent performance

---

## 🐛 Troubleshooting

### k6 command not found

```bash
# The npm package provides the runner
cd src
npx k6 run ../tests/load/simple-test.js
```

### Server not responding

```bash
# Make sure server is running
npm run dev

# Check server is accessible
curl http://localhost:3000/health
```

### High error rates

```bash
# Check server logs
# Look for errors in the terminal running npm run dev
```

---

## 📖 Further Reading

- [k6 Documentation](https://k6.io/docs/)
- [k6 Test Types](https://k6.io/docs/test-types/)
- [k6 Metrics](https://k6.io/docs/using-k6/metrics/)
- [k6 Thresholds](https://k6.io/docs/using-k6/thresholds/)

---

**Ready to test?** Start with the simple test and work your way up! 🚀
