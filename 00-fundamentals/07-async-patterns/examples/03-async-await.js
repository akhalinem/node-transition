// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Async/Await - Modern Async Code That Reads Like Sync
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("⚡ Understanding Async/Await");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

// ========================================
// Part 1: What is Async/Await?
// ========================================

console.log("=== 1. Async/Await Basics ===\n");

console.log("async/await is syntactic sugar over Promises");
console.log("Makes async code look and behave like synchronous code\n");

// ========================================
// Part 2: Basic async Function
// ========================================

console.log("=== 2. Creating Async Functions ===\n");

// Regular async function
async function fetchUser(id) {
  console.log(`Fetching user ${id}...`);

  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id, name: "Alice", email: "alice@example.com" });
    }, 500);
  });
}

// Async arrow function
const fetchPosts = async (userId) => {
  console.log(`Fetching posts for user ${userId}...`);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, title: "First Post", userId },
        { id: 2, title: "Second Post", userId },
      ]);
    }, 500);
  });
};

console.log("✅ async functions always return a Promise");
console.log("✅ Even if you return a regular value, it gets wrapped\n");

async function demo1() {
  const user = await fetchUser(1);
  console.log("Got user:", user.name);

  const posts = await fetchPosts(user.id);
  console.log("Got posts:", posts.length);
  console.log("");

  continueDemo();
}

demo1();

function continueDemo() {
  // ========================================
  // Part 3: Comparison with Promises
  // ========================================

  console.log("=== 3. Promises vs Async/Await ===\n");

  function delay(ms, value) {
    return new Promise((resolve) => setTimeout(() => resolve(value), ms));
  }

  console.log("Promise style:");
  console.log(`
function getDataPromise() {
  return fetchUser(1)
    .then(user => fetchPosts(user.id))
    .then(posts => processPosts(posts))
    .catch(error => console.error(error));
}
`);

  console.log("Async/Await style (cleaner!):");
  console.log(`
async function getDataAsync() {
  try {
    const user = await fetchUser(1);
    const posts = await fetchPosts(user.id);
    const result = await processPosts(posts);
    return result;
  } catch (error) {
    console.error(error);
  }
}
`);

  console.log("Both do the same thing, but async/await is:");
  console.log("  ✅ Easier to read");
  console.log("  ✅ Looks like synchronous code");
  console.log("  ✅ Better error handling with try-catch\n");

  setTimeout(showErrorHandling, 100);
}

function showErrorHandling() {
  // ========================================
  // Part 4: Error Handling
  // ========================================

  console.log("=== 4. Error Handling with Try-Catch ===\n");

  async function riskyOperation(shouldFail) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldFail) {
          reject(new Error("Operation failed!"));
        } else {
          resolve("Success!");
        }
      }, 100);
    });
  }

  async function handleErrors() {
    // Success case
    try {
      const result = await riskyOperation(false);
      console.log("✅ Success:", result);
    } catch (error) {
      console.error("❌ Error:", error.message);
    }

    // Error case
    try {
      const result = await riskyOperation(true);
      console.log("This won't run");
    } catch (error) {
      console.error("❌ Caught error:", error.message);
    }

    console.log("");
    setTimeout(showMultipleAwaits, 100);
  }

  handleErrors();
}

function showMultipleAwaits() {
  // ========================================
  // Part 5: Multiple Awaits (Sequential vs Parallel)
  // ========================================

  console.log("=== 5. Sequential vs Parallel Execution ===\n");

  function fetchData(name, ms) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`  Fetched ${name}`);
        resolve({ name, data: `${name} data` });
      }, ms);
    });
  }

  // ❌ Sequential - SLOW
  async function sequentialDemo() {
    console.log("Sequential execution (one after another):");
    const start = Date.now();

    const a = await fetchData("A", 500); // Wait 500ms
    const b = await fetchData("B", 500); // Then wait another 500ms
    const c = await fetchData("C", 500); // Then wait another 500ms

    const elapsed = Date.now() - start;
    console.log(`  Total time: ${elapsed}ms (should be ~1500ms)\n`);

    parallelDemo();
  }

  // ✅ Parallel - FAST
  async function parallelDemo() {
    console.log("Parallel execution (all at once):");
    const start = Date.now();

    // Start all operations simultaneously
    const promiseA = fetchData("A", 500);
    const promiseB = fetchData("B", 500);
    const promiseC = fetchData("C", 500);

    // Wait for all to complete
    const [a, b, c] = await Promise.all([promiseA, promiseB, promiseC]);

    const elapsed = Date.now() - start;
    console.log(`  Total time: ${elapsed}ms (should be ~500ms)\n`);

    console.log("Key insight:");
    console.log("  • await pauses execution");
    console.log("  • Start operations first, then await them together");
    console.log("  • Use Promise.all() for parallel execution\n");

    setTimeout(showRealWorldExample, 100);
  }

  sequentialDemo();
}

function showRealWorldExample() {
  // ========================================
  // Part 6: Real-World Example
  // ========================================

  console.log("=== 6. Real-World Example ===\n");

  // Simulate API calls
  async function getUser(id) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { id, name: "Alice", following: [2, 3] };
  }

  async function getUserPosts(userId) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return [
      { id: 1, userId, title: "My First Post" },
      { id: 2, userId, title: "Another Post" },
    ];
  }

  async function getPostLikes(postId) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return Math.floor(Math.random() * 100);
  }

  async function getDashboardData(userId) {
    try {
      console.log("Loading dashboard...\n");

      // Get user data first (needed for next steps)
      const user = await getUser(userId);
      console.log("1. Got user:", user.name);

      // Get posts and following data in parallel
      const [posts, followingUsers] = await Promise.all([
        getUserPosts(user.id),
        Promise.all(user.following.map((id) => getUser(id))),
      ]);

      console.log("2. Got posts:", posts.length);
      console.log("3. Got following:", followingUsers.length);

      // Get likes for all posts in parallel
      const likeCounts = await Promise.all(
        posts.map((post) => getPostLikes(post.id))
      );

      console.log("4. Got all like counts:", likeCounts);

      // Combine everything
      const dashboard = {
        user,
        posts: posts.map((post, i) => ({
          ...post,
          likes: likeCounts[i],
        })),
        following: followingUsers,
      };

      console.log("\n✅ Dashboard loaded successfully!");
      console.log("Total posts:", dashboard.posts.length);
      console.log(
        "Total likes:",
        dashboard.posts.reduce((sum, p) => sum + p.likes, 0)
      );
      console.log("");

      setTimeout(showAdvancedPatterns, 100);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    }
  }

  getDashboardData(1);
}

function showAdvancedPatterns() {
  // ========================================
  // Part 7: Advanced Patterns
  // ========================================

  console.log("=== 7. Advanced Async/Await Patterns ===\n");

  // Pattern 1: Async IIFE
  console.log(
    "Pattern 1: Async IIFE (Immediately Invoked Function Expression)"
  );
  console.log(
    "─────────────────────────────────────────────────────────────────\n"
  );

  (async () => {
    console.log("Inside async IIFE");
    await new Promise((resolve) => setTimeout(resolve, 100));
    console.log("Useful for running async code at module level\n");

    pattern2();
  })();
}

async function pattern2() {
  console.log("Pattern 2: Conditional Awaiting");
  console.log("────────────────────────────────\n");

  async function fetchData(useCache) {
    if (useCache) {
      return "cached data"; // No await needed for sync value
    }

    // Only await when actually making async call
    return await new Promise((resolve) => {
      setTimeout(() => resolve("fresh data"), 100);
    });
  }

  console.log("With cache:", await fetchData(true));
  console.log("Without cache:", await fetchData(false));
  console.log("");

  pattern3();
}

async function pattern3() {
  console.log("Pattern 3: Promise.allSettled with Async/Await");
  console.log("───────────────────────────────────────────────\n");

  async function fetchMultipleAPIs() {
    const results = await Promise.allSettled([
      fetch("https://api.example.com/users"),
      fetch("https://api.example.com/posts"),
      fetch("https://api.example.com/comments"),
    ]);

    // Handle each result
    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        console.log(`  API ${index + 1}: Success`);
      } else {
        console.log(`  API ${index + 1}: Failed -`, result.reason.message);
      }
    });
  }

  // Simulate with mocked fetch
  global.fetch = (url) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (url.includes("posts")) {
          reject(new Error("API down"));
        } else {
          resolve({ url, data: "success" });
        }
      }, 100);
    });
  };

  await fetchMultipleAPIs();
  console.log("");

  setTimeout(showCommonMistakes, 100);
}

function showCommonMistakes() {
  // ========================================
  // Part 8: Common Mistakes
  // ========================================

  console.log("=== 8. Common Mistakes to Avoid ===\n");

  console.log("❌ Mistake 1: Forgetting await");
  console.log("──────────────────────────────────\n");
  console.log(`
async function wrong() {
  const promise = asyncOperation(); // Forgot await!
  console.log(promise); // Logs Promise object, not value
}

async function correct() {
  const value = await asyncOperation(); // ✅ Correct
  console.log(value); // Logs actual value
}
`);

  console.log("❌ Mistake 2: Sequential when you want parallel");
  console.log("───────────────────────────────────────────────\n");
  console.log(`
// SLOW - runs one at a time
const a = await fetch(url1);
const b = await fetch(url2);

// FAST - runs in parallel
const [a, b] = await Promise.all([
  fetch(url1),
  fetch(url2)
]);
`);

  console.log("❌ Mistake 3: Using async in array methods");
  console.log("──────────────────────────────────────────────\n");
  console.log(`
// WRONG - forEach doesn't wait for async
items.forEach(async (item) => {
  await processItem(item); // ❌ Doesn't wait
});

// CORRECT - use for...of or Promise.all
for (const item of items) {
  await processItem(item); // ✅ Sequential
}

// Or parallel:
await Promise.all(items.map(item => processItem(item)));
`);

  setTimeout(showSummary, 100);
}

function showSummary() {
  // ========================================
  // Summary
  // ========================================

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📝 Key Takeaways");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("✅ async functions always return a Promise");
  console.log("✅ await pauses execution until Promise resolves");
  console.log("✅ Use try-catch for error handling");
  console.log("✅ await only works inside async functions");
  console.log("✅ Multiple awaits are sequential (one after another)");
  console.log("✅ Use Promise.all() for parallel execution");
  console.log("✅ Use Promise.allSettled() to get all results");
  console.log("✅ Don't forget await (or you get a Promise!)");
  console.log("✅ Avoid async in forEach (use for...of instead)\n");

  console.log("🎯 Async/await is the modern standard for async code!");
  console.log("   Clean, readable, and powerful.\n");

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log(
    "Next: Run 04-promise-combinators.js to master Promise utilities!\n"
  );
}
