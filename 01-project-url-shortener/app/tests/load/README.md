# Load Testing Guide

## Overview

This directory contains k6 load tests for the URL shortener service. The tests are designed to validate the **1,000 req/sec with <50ms response time** performance target.

## Test Suite

### 1. **Smoke Test** (`smoke.js`)

**Purpose**: Quick sanity check before running larger tests

```bash
k6 run tests/load/smoke.js
```

- ✅ Validates all endpoints work
- ✅ Checks health endpoints
- ✅ Verifies error handling
- ✅ Takes ~1 second

**Run this first!** If smoke test fails, fix issues before running other tests.

### 2. **Baseline Test** (`baseline.js`)

**Purpose**: Test basic performance under light load

```bash
k6 run tests/load/baseline.js
```

- 50 concurrent users
- 2 minute duration
- Target: 95% of requests < 100ms

**Use this to**: Establish baseline performance metrics

### 3. **Stress Test** (`stress.js`) ⭐ **Main Test**

**Purpose**: Test the 1,000 req/sec target

```bash
k6 run tests/load/stress.js
```

- Ramps up to 1,000 concurrent users
- 7 minute total duration
- Target: 95% of requests < 50ms, 99% < 100ms

**This is the critical test!** Must pass to meet project requirements.

### 4. **Spike Test** (`spike.js`)

**Purpose**: Test sudden traffic spikes (viral URL scenario)

```bash
k6 run tests/load/spike.js
```

- Sudden 20x increase in traffic
- Tests system resilience
- Target: < 5% error rate

### 5. **Write Performance Test** (`write-heavy.js`)

**Purpose**: Test POST endpoint performance

```bash
k6 run tests/load/write-heavy.js
```

- 100 concurrent users creating URLs
- Target: 95% of requests < 200ms
- Tests database write performance

### 6. **Mixed Workload Test** (`mixed.js`)

**Purpose**: Realistic mix of reads and writes

```bash
k6 run tests/load/mixed.js
```

- 80% reads (redirects)
- 20% writes (URL creation)
- 500 concurrent users

## Running Tests

### Prerequisites

1. **Start the application**:

```bash
npm start
```

2. **Ensure database and Redis are running**:

```bash
# Check health endpoint
curl http://localhost:3000/health
```

### Run Individual Test

```bash
cd app/
k6 run tests/load/smoke.js
```

### Run All Tests

```bash
# Run tests in order
k6 run tests/load/smoke.js
k6 run tests/load/baseline.js
k6 run tests/load/stress.js
k6 run tests/load/spike.js
k6 run tests/load/write-heavy.js
k6 run tests/load/mixed.js
```

### Custom Configuration

Override base URL:

```bash
k6 run --env BASE_URL=http://production-server:3000 tests/load/stress.js
```

Increase duration:

```bash
# Edit the options.stages in the test file
```

## Understanding Results

### Key Metrics

**http_req_duration**: Response time

- `p(50)`: Median (50th percentile)
- `p(95)`: 95th percentile - **our main target**
- `p(99)`: 99th percentile
- `max`: Worst case

**http_req_failed**: Error rate

- Should be < 1% (< 0.01)

**http_reqs**: Requests per second

- Target: 1,000 req/sec during peak load

**checks**: Validation pass rate

- Should be > 95%

### Success Criteria

✅ **Stress test passes with**:

- `http_req_duration p(95) < 50ms`
- `http_req_duration p(99) < 100ms`
- `http_req_failed rate < 0.01`
- `http_reqs ~1,000/s` during peak

### Example Output

```
     ✓ status is 301
     ✓ has location header
     ✓ response time < 50ms

     checks.........................: 98.50%  ✓ 29550     ✗ 450
     http_req_duration..............: avg=23ms  p(95)=45ms  p(99)=89ms
     http_req_failed................: 0.20%   ✓ 60        ✗ 29940
     http_reqs......................: 30000   1000/s
```

## Troubleshooting

### Tests Failing?

1. **Check health endpoint first**:

```bash
curl http://localhost:3000/health
```

2. **Monitor server logs**:

```bash
# Watch for errors in application logs
npm run dev
```

3. **Check database connection pool**:

- May need to increase `max` in database config

4. **Check Redis memory**:

```bash
redis-cli INFO memory
```

### Common Issues

**"Connection refused"**

- Application not running
- Wrong BASE_URL

**"Too many open files"**

- Increase system file descriptor limit

```bash
ulimit -n 10000
```

**"Database connection pool exhausted"**

- Increase pool size in `config/database.js`
- Current: max: 50, may need to increase

**"Redis OOM"**

- Redis out of memory
- Check cache TTL settings
- Increase Redis memory limit

## Performance Optimization Checklist

If tests fail, optimize in this order:

1. ✅ **Database Indexes** - Add indexes on frequently queried columns
2. ✅ **Redis Caching** - Cache hot URLs in Redis
3. ✅ **Connection Pooling** - Tune pool size (currently: 50)
4. ✅ **Query Optimization** - Use EXPLAIN ANALYZE on queries
5. [ ] **Code Profiling** - Use Node.js --inspect to find bottlenecks
6. [ ] **Horizontal Scaling** - Add more application instances

## Next Steps

After running load tests:

1. **Document results** in `docs/performance-report.md`
2. **Identify bottlenecks** using k6 output + server logs
3. **Optimize** based on findings
4. **Re-test** to validate improvements
5. **Iterate** until success criteria met

## Advanced k6 Features

### Output Results to File

```bash
k6 run --out json=results.json tests/load/stress.js
```

### Generate HTML Report

```bash
k6 run --out json=results.json tests/load/stress.js
# Use k6-reporter to convert to HTML
```

### Cloud Results (k6 Cloud)

```bash
k6 login cloud
k6 cloud tests/load/stress.js
```

### Custom Metrics

See `stress.js` for examples of custom metrics:

```javascript
import { Rate, Trend } from "k6/metrics";
const errorRate = new Rate("errors");
const customMetric = new Trend("custom_duration");
```

## Resources

- [k6 Documentation](https://k6.io/docs/)
- [k6 Examples](https://k6.io/docs/examples/)
- [Performance Testing Guide](https://k6.io/docs/testing-guides/)

---

**Remember**: Load testing in production can impact real users. Always test in a dedicated environment first!
