// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Exercise 2: Parallel API Requests
// Difficulty: ⭐⭐⭐
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("🎯 Exercise 2: Efficient Parallel Requests");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

console.log("Goal: Fetch multiple URLs efficiently");
console.log("Skills: Promise.all, error handling, optimization\n");

// Simulate API calls
function fetchURL(url) {
  const delay = Math.random() * 500 + 500; // 500-1000ms

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 20% chance of failure
      if (Math.random() < 0.2) {
        reject(new Error(`Failed to fetch ${url}`));
      } else {
        resolve({
          url,
          data: `Data from ${url}`,
          timestamp: Date.now(),
        });
      }
    }, delay);
  });
}

// ========================================
// Task 1: Fetch All URLs in Parallel
// ========================================

console.log("=== Task 1: Basic Parallel Fetch ===\n");

const urls = [
  "https://api.example.com/users",
  "https://api.example.com/posts",
  "https://api.example.com/comments",
  "https://api.example.com/likes",
  "https://api.example.com/tags",
];

// TODO: Fetch all URLs in parallel
// Should complete in ~1 second (not 5 seconds sequentially)
async function fetchAllURLs(urls) {
  // YOUR CODE HERE
  // Return array of results
}

// Uncomment to test:
/*
console.log('Fetching', urls.length, 'URLs in parallel...\n');

const start = Date.now();
fetchAllURLs(urls)
  .then(results => {
    const elapsed = Date.now() - start;
    console.log(`✅ Fetched ${results.length} URLs in ${elapsed}ms`);
    console.log('Expected: ~1000ms (not ~5000ms)\n');
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
  });
*/

console.log("👉 Complete fetchAllURLs() and test it\n");

// ========================================
// Task 2: Handle Failures Gracefully
// ========================================

console.log("=== Task 2: Resilient Parallel Fetch ===\n");

// TODO: Fetch all URLs but don't fail if some fail
// Return object with { successful: [], failed: [] }
async function fetchAllResilient(urls) {
  // YOUR CODE HERE
  // Hint: Use Promise.allSettled
}

// Uncomment to test:
/*
console.log('Fetching with resilience...\n');

fetchAllResilient(urls)
  .then(result => {
    console.log(`✅ Successful: ${result.successful.length}`);
    console.log(`❌ Failed: ${result.failed.length}`);
    
    result.failed.forEach(failure => {
      console.log(`   - ${failure.url}: ${failure.error}`);
    });
    console.log('');
  });
*/

console.log("👉 Complete fetchAllResilient() and test it\n");

// ========================================
// Task 3: Fetch with Timeout
// ========================================

console.log("=== Task 3: Add Timeout Protection ===\n");

// TODO: Fetch URL with timeout
// If takes longer than timeout, reject with timeout error
function fetchWithTimeout(url, timeoutMs = 2000) {
  // YOUR CODE HERE
  // Hint: Use Promise.race with a timeout promise
}

// Uncomment to test:
/*
console.log('Testing timeout (some will timeout)...\n');

const testURLs = [
  'https://api.example.com/fast',
  'https://api.example.com/slow',
  'https://api.example.com/medium'
];

Promise.all(testURLs.map(url => 
  fetchWithTimeout(url, 800)
    .catch(err => ({ error: err.message }))
))
  .then(results => {
    results.forEach((result, i) => {
      if (result.error) {
        console.log(`❌ ${testURLs[i]}: ${result.error}`);
      } else {
        console.log(`✅ ${testURLs[i]}: Success`);
      }
    });
    console.log('');
  });
*/

console.log("👉 Complete fetchWithTimeout() and test it\n");

// ========================================
// Task 4: Fetch with Retry Logic
// ========================================

console.log("=== Task 4: Add Retry on Failure ===\n");

// TODO: Fetch with retry
// Retry up to maxRetries times on failure
async function fetchWithRetry(url, maxRetries = 3) {
  // YOUR CODE HERE
  // Hint: Use a loop, catch errors, retry if attempts remain
}

// Uncomment to test:
/*
console.log('Testing retry logic...\n');

fetchWithRetry('https://api.example.com/flaky', 3)
  .then(result => {
    console.log('✅ Success after retries:', result.url);
    console.log('');
  })
  .catch(error => {
    console.log('❌ Failed after all retries:', error.message);
    console.log('');
  });
*/

console.log("👉 Complete fetchWithRetry() and test it\n");

// ========================================
// Task 5: Advanced - Fetch with Priority
// ========================================

console.log("=== Task 5: Priority-Based Fetching ===\n");

// TODO: Fetch URLs in priority order
// High priority: fetch immediately
// Medium priority: fetch after high priority
// Low priority: fetch after medium priority
async function fetchWithPriority(urlsWithPriority) {
  // urlsWithPriority = [
  //   { url: '...', priority: 'high' },
  //   { url: '...', priority: 'medium' },
  //   { url: '...', priority: 'low' }
  // ]
  // YOUR CODE HERE
  // Return results in completion order but respect priority
}

// Uncomment to test:
/*
const priorityURLs = [
  { url: 'https://api.example.com/critical', priority: 'high' },
  { url: 'https://api.example.com/important', priority: 'high' },
  { url: 'https://api.example.com/normal-1', priority: 'medium' },
  { url: 'https://api.example.com/normal-2', priority: 'medium' },
  { url: 'https://api.example.com/optional', priority: 'low' }
];

console.log('Fetching with priority...\n');

fetchWithPriority(priorityURLs)
  .then(results => {
    console.log('✅ All fetched in priority order');
    results.forEach(result => {
      console.log(`   ${result.url} (${result.priority})`);
    });
    console.log('');
  });
*/

console.log("👉 Complete fetchWithPriority() and test it\n");

// ========================================
// Bonus Challenge
// ========================================

console.log("=== 🏆 Bonus Challenge: Fetch with Smart Retry ===\n");

console.log("Create a fetchSmart() function that:");
console.log("  1. Fetches multiple URLs in parallel");
console.log("  2. Has timeout protection (2 seconds)");
console.log("  3. Retries failed requests (max 3 times)");
console.log("  4. Uses exponential backoff (1s, 2s, 4s)");
console.log("  5. Returns { successful, failed } even if some fail\n");

async function fetchSmart(urls, options = {}) {
  const { timeout = 2000, maxRetries = 3, baseDelay = 1000 } = options;

  // YOUR CODE HERE
  // Combine all techniques from above!
}

// Uncomment to test:
/*
console.log('Testing smart fetch...\n');

const smartURLs = [
  'https://api.example.com/endpoint1',
  'https://api.example.com/endpoint2',
  'https://api.example.com/endpoint3',
  'https://api.example.com/endpoint4',
  'https://api.example.com/endpoint5'
];

fetchSmart(smartURLs)
  .then(results => {
    console.log('✅ Smart fetch complete!');
    console.log(`   Successful: ${results.successful.length}`);
    console.log(`   Failed: ${results.failed.length}`);
  });
*/

console.log("👉 Try the bonus challenge for extra practice!\n");

// ========================================
// Solution Hints
// ========================================

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("💡 Hints");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

console.log("Task 1:");
console.log("  return Promise.all(urls.map(url => fetchURL(url)));\n");

console.log("Task 2:");
console.log(`
  const results = await Promise.allSettled(urls.map(url => fetchURL(url)));
  return {
    successful: results.filter(r => r.status === 'fulfilled').map(r => r.value),
    failed: results.filter(r => r.status === 'rejected').map(r => r.reason)
  };
`);

console.log("Task 3:");
console.log(`
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), timeoutMs)
  );
  return Promise.race([fetchURL(url), timeoutPromise]);
`);

console.log("Task 4:");
console.log(`
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fetchURL(url);
    } catch (error) {
      if (attempt === maxRetries) throw error;
    }
  }
`);

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

console.log("📚 Testing:");
console.log("   Uncomment each test section one at a time");
console.log("   Complete the function before moving to next task");
console.log("   Run: node exercise-2-parallel-requests.js\n");

console.log("Next: exercise-3-concurrency-limiter.js\n");
