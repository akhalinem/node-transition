/**
 * Measure Redirect Time
 * Tests only the redirect response time, not the final destination
 */

const http = require("http");

function measureRedirectTime(shortCode, iterations = 10) {
  const times = [];
  let completed = 0;

  console.log(`\n📊 Measuring redirect time for: /${shortCode}`);
  console.log(`Running ${iterations} requests...\n`);

  for (let i = 0; i < iterations; i++) {
    const startTime = Date.now();

    const req = http.get(`http://localhost:3000/${shortCode}`, (res) => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      times.push(duration);

      // Don't follow the redirect - just measure the response
      res.resume(); // Drain the response

      completed++;
      if (completed === iterations) {
        printResults(times);
      }
    });

    req.on("error", (err) => {
      console.error("Error:", err.message);
    });
  }
}

function printResults(times) {
  times.sort((a, b) => a - b);

  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = times[0];
  const max = times[times.length - 1];
  const p50 = times[Math.floor(times.length * 0.5)];
  const p95 = times[Math.floor(times.length * 0.95)];
  const p99 = times[Math.floor(times.length * 0.99)];

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📈 Results:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Average:  ${avg.toFixed(2)}ms`);
  console.log(`Min:      ${min}ms`);
  console.log(`Max:      ${max}ms`);
  console.log(`p50:      ${p50}ms`);
  console.log(`p95:      ${p95}ms ${p95 < 50 ? "✅" : "❌ (Target: <50ms)"}`);
  console.log(`p99:      ${p99}ms`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  if (p95 < 50) {
    console.log("🎉 SUCCESS! Meeting <50ms requirement at p95!\n");
  } else {
    console.log("⚠️  WARNING: Not meeting <50ms requirement. Optimize!\n");
  }
}

// Usage
const shortCode = process.argv[2] || "abc123";
const iterations = parseInt(process.argv[3]) || 100;

console.log("🚀 Redirect Time Measurement Tool");
console.log("Usage: node measure-redirect-time.js [shortCode] [iterations]");

measureRedirectTime(shortCode, iterations);
