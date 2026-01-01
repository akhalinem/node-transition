// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Promise Combinators - All, Race, AllSettled, Any
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("🔧 Promise Combinators");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

// Helper function to simulate API calls
function fetchAPI(name, delay, shouldFail = false) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error(`${name} failed`));
      } else {
        console.log(`  ✅ ${name} completed`);
        resolve({ name, data: `${name} data`, delay });
      }
    }, delay);
  });
}

// ========================================
// Part 1: Promise.all()
// ========================================

console.log("=== 1. Promise.all() - Wait for All, Fail Fast ===\n");

console.log(
  "Use when: You need ALL results and want to fail fast on any error\n"
);

async function demonstratePromiseAll() {
  console.log("Example 1: All succeed");
  console.log("──────────────────────\n");

  try {
    const results = await Promise.all([
      fetchAPI("API-1", 300),
      fetchAPI("API-2", 200),
      fetchAPI("API-3", 100),
    ]);

    console.log(
      "\nAll results:",
      results.map((r) => r.name)
    );
    console.log("Note: Results maintain order, not completion order\n");
  } catch (error) {
    console.error("Error:", error.message);
  }

  console.log("Example 2: One fails");
  console.log("─────────────────────\n");

  try {
    const results = await Promise.all([
      fetchAPI("API-1", 300),
      fetchAPI("API-2", 200, true), // This one fails
      fetchAPI("API-3", 100),
    ]);

    console.log("Results:", results);
  } catch (error) {
    console.error("  ❌ Promise.all rejected:", error.message);
    console.log("  ⚠️  Lost all successful results!");
    console.log("  ⚠️  API-1 and API-3 completed but we can't access them\n");
  }

  console.log("When to use Promise.all():");
  console.log("  ✅ Need all results to proceed");
  console.log("  ✅ If one fails, the rest don't matter");
  console.log("  ✅ Want to fail fast on first error\n");

  setTimeout(demonstratePromiseAllSettled, 500);
}

demonstratePromiseAll();

// ========================================
// Part 2: Promise.allSettled()
// ========================================

function demonstratePromiseAllSettled() {
  console.log("=== 2. Promise.allSettled() - Wait for All, Never Reject ===\n");

  console.log(
    "Use when: You want ALL results, regardless of success or failure\n"
  );

  async function demo() {
    console.log("Example: Mixed success and failure");
    console.log("───────────────────────────────────\n");

    const results = await Promise.allSettled([
      fetchAPI("API-1", 200),
      fetchAPI("API-2", 150, true), // Fails
      fetchAPI("API-3", 100),
      fetchAPI("API-4", 250, true), // Fails
      fetchAPI("API-5", 300),
    ]);

    console.log("\nAll results returned:");
    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        console.log(`  ${index + 1}. ✅ Success:`, result.value.name);
      } else {
        console.log(`  ${index + 1}. ❌ Failed:`, result.reason.message);
      }
    });

    console.log("\nProcessing results:");
    const successful = results.filter((r) => r.status === "fulfilled");
    const failed = results.filter((r) => r.status === "rejected");

    console.log(`  Successful: ${successful.length}`);
    console.log(`  Failed: ${failed.length}`);
    console.log("");

    console.log("When to use Promise.allSettled():");
    console.log("  ✅ Want results from all operations");
    console.log("  ✅ Some failures are acceptable");
    console.log("  ✅ Need to process successes even if some fail");
    console.log("  ✅ Analytics, logging, health checks\n");

    setTimeout(demonstratePromiseRace, 500);
  }

  demo();
}

// ========================================
// Part 3: Promise.race()
// ========================================

function demonstratePromiseRace() {
  console.log("=== 3. Promise.race() - First to Settle Wins ===\n");

  console.log("Use when: You want the first result, success or failure\n");

  async function demo() {
    console.log("Example 1: Fastest API wins");
    console.log("───────────────────────────\n");

    const start = Date.now();
    const result = await Promise.race([
      fetchAPI("Slow-API", 500),
      fetchAPI("Medium-API", 300),
      fetchAPI("Fast-API", 100), // This wins!
    ]);

    const elapsed = Date.now() - start;
    console.log(`\nWinner: ${result.name} (took ~${elapsed}ms)`);
    console.log("Other promises still running but we don't wait\n");

    // Wait for others to complete (for demo purposes)
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log("\nExample 2: Timeout pattern");
    console.log("─────────────────────────\n");

    function timeout(ms) {
      return new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout!")), ms)
      );
    }

    try {
      const result = await Promise.race([
        fetchAPI("Slow-API", 2000),
        timeout(1000), // 1 second timeout
      ]);
      console.log("Result:", result);
    } catch (error) {
      console.log("  ❌ Race rejected:", error.message);
      console.log("  ⏱️  Timeout won the race!\n");
    }

    console.log("When to use Promise.race():");
    console.log("  ✅ Implementing timeouts");
    console.log("  ✅ Multiple data sources (use fastest)");
    console.log("  ✅ User cancellation");
    console.log("  ✅ Fallback to cached data\n");

    setTimeout(demonstratePromiseAny, 500);
  }

  demo();
}

// ========================================
// Part 4: Promise.any()
// ========================================

function demonstratePromiseAny() {
  console.log("=== 4. Promise.any() - First Success Wins ===\n");

  console.log("Use when: You want the first SUCCESSFUL result\n");

  async function demo() {
    console.log("Example 1: First success wins (ignores failures)");
    console.log("─────────────────────────────────────────────\n");

    try {
      const result = await Promise.any([
        fetchAPI("Failing-API", 100, true), // Fails fast
        fetchAPI("Slow-but-works", 500), // Succeeds slowly
        fetchAPI("Also-failing", 200, true), // Also fails
      ]);

      console.log(`\nWinner: ${result.name}`);
      console.log("Note: Failures were ignored until first success\n");
    } catch (error) {
      console.error("All failed:", error);
    }

    console.log("Example 2: All fail");
    console.log("──────────────────\n");

    try {
      const result = await Promise.any([
        fetchAPI("API-1", 100, true),
        fetchAPI("API-2", 150, true),
        fetchAPI("API-3", 200, true),
      ]);
      console.log("Result:", result);
    } catch (error) {
      console.log(`  ❌ All rejected: ${error.constructor.name}`);
      console.log(
        `  ❌ Errors: ${error.errors.map((e) => e.message).join(", ")}\n`
      );
    }

    console.log("When to use Promise.any():");
    console.log("  ✅ Multiple redundant servers");
    console.log("  ✅ Fallback to mirrors/CDNs");
    console.log("  ✅ Try multiple strategies, use first success");
    console.log("  ✅ Resilient API calls\n");

    setTimeout(showRealWorldExamples, 500);
  }

  demo();
}

// ========================================
// Part 5: Real-World Examples
// ========================================

function showRealWorldExamples() {
  console.log("=== 5. Real-World Use Cases ===\n");

  // Use Case 1: Loading Dashboard Data
  console.log("Use Case 1: Dashboard Loading");
  console.log("─────────────────────────────\n");

  async function loadDashboard() {
    console.log("Loading dashboard sections in parallel...\n");

    const [userData, postsData, statsData] = await Promise.all([
      fetchAPI("UserProfile", 200),
      fetchAPI("UserPosts", 300),
      fetchAPI("UserStats", 150),
    ]);

    console.log("\nDashboard ready!");
    console.log("All sections loaded in ~300ms (not 650ms sequential)\n");
  }

  loadDashboard().then(() => {
    setTimeout(useCase2, 500);
  });
}

function useCase2() {
  console.log("Use Case 2: Resilient API Call");
  console.log("──────────────────────────────\n");

  async function resilientFetch() {
    console.log("Trying multiple API endpoints...\n");

    try {
      const result = await Promise.any([
        fetchAPI("Primary-Server", 300, true), // Down
        fetchAPI("Backup-Server-1", 400, true), // Also down
        fetchAPI("Backup-Server-2", 200), // Works!
      ]);

      console.log(`\nSuccess from: ${result.name}`);
      console.log("System stayed online despite failures!\n");
    } catch (error) {
      console.error("All servers down:", error);
    }
  }

  resilientFetch().then(() => {
    setTimeout(useCase3, 500);
  });
}

function useCase3() {
  console.log("Use Case 3: Health Check System");
  console.log("────────────────────────────────\n");

  async function healthCheck() {
    console.log("Checking all services...\n");

    const services = [
      fetchAPI("Database", 100),
      fetchAPI("Cache", 150, true), // Fails
      fetchAPI("Queue", 120),
      fetchAPI("Storage", 200, true), // Fails
    ];

    const results = await Promise.allSettled(services);

    const healthy = results.filter((r) => r.status === "fulfilled").length;
    const total = results.length;

    console.log(`\nHealth Status: ${healthy}/${total} services healthy`);

    results.forEach((result, i) => {
      const status = result.status === "fulfilled" ? "✅" : "❌";
      const name =
        result.status === "fulfilled" ? result.value.name : `Service-${i + 1}`;
      console.log(`  ${status} ${name}`);
    });

    console.log("");
    setTimeout(showComparison, 500);
  }

  healthCheck();
}

function showComparison() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 Comparison Table");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const table = `
╔═══════════════╤══════════════════╤═══════════════╤═══════════════╗
║ Method        │ Resolves When    │ Rejects When  │ Returns       ║
╠═══════════════╪══════════════════╪═══════════════╪═══════════════╣
║ all()         │ All fulfill      │ Any rejects   │ Array         ║
║ allSettled()  │ All settle       │ Never!        │ Result array  ║
║ race()        │ First settles    │ First rejects │ Single value  ║
║ any()         │ First fulfills   │ All reject    │ Single value  ║
╚═══════════════╧══════════════════╧═══════════════╧═══════════════╝
`;

  console.log(table);

  console.log("Decision Guide:");
  console.log("──────────────\n");

  console.log("Need ALL results and can't proceed if any fail?");
  console.log("  → Use Promise.all()\n");

  console.log("Need to try ALL, get results from each?");
  console.log("  → Use Promise.allSettled()\n");

  console.log("Need the FASTEST result (success or failure)?");
  console.log("  → Use Promise.race()\n");

  console.log("Need the FIRST SUCCESS (ignore failures)?");
  console.log("  → Use Promise.any()\n");

  setTimeout(showSummary, 100);
}

function showSummary() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📝 Key Takeaways");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("✅ Promise.all() - Need all, fail fast");
  console.log("✅ Promise.allSettled() - Get all results, never reject");
  console.log("✅ Promise.race() - First to complete wins");
  console.log("✅ Promise.any() - First success wins");
  console.log("✅ Choose based on your specific needs");
  console.log("✅ Combine with async/await for clean code");
  console.log("✅ Use for parallel operations, not sequential\n");

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log(
    "Next: Run 05-concurrency-control.js to learn about limiting parallel operations!\n"
  );
}
