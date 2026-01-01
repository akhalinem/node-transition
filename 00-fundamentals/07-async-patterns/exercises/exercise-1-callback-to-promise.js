// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Exercise 1: Convert Callbacks to Promises
// Difficulty: ⭐⭐
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("🎯 Exercise 1: Callback to Promise Conversion");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

console.log("Goal: Convert callback-based functions to Promises\n");
console.log("Skills: Promise creation, error handling, promisification\n");

// ========================================
// Task 1: Basic Promisification
// ========================================

console.log("=== Task 1: Promisify a Simple Callback ===\n");

// Given: Callback-based function
function getUserCallback(userId, callback) {
  setTimeout(() => {
    if (userId < 1) {
      callback(new Error("Invalid user ID"), null);
    } else {
      callback(null, { id: userId, name: "Alice", email: "alice@example.com" });
    }
  }, 100);
}

// TODO: Create a Promise-based version
function getUserPromise(userId) {
  // YOUR CODE HERE
  // Hint: return new Promise((resolve, reject) => { ... })
}

// Uncomment to test your solution:
/*
console.log('Testing getUserPromise...');

getUserPromise(1)
  .then(user => {
    console.log('✅ Success:', user);
    return getUserPromise(-1); // Try error case
  })
  .catch(error => {
    console.log('✅ Error caught:', error.message);
    console.log('');
    // Move to next task
  });
*/

console.log("👉 Complete getUserPromise() and uncomment the test\n");

// ========================================
// Task 2: Promisify fs.readFile
// ========================================

console.log("=== Task 2: Promisify fs.readFile ===\n");

const fs = require("fs");
const path = require("path");

// TODO: Create a promisified version of fs.readFile
function readFilePromise(filename, encoding) {
  // YOUR CODE HERE
}

// Uncomment to test:
/*
const testFile = path.join(__dirname, '../README.md');

readFilePromise(testFile, 'utf8')
  .then(content => {
    console.log('✅ File read successfully');
    console.log('First 50 chars:', content.substring(0, 50) + '...');
    console.log('');
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
  });
*/

console.log("👉 Complete readFilePromise() and test it\n");

// ========================================
// Task 3: Chain Multiple Async Operations
// ========================================

console.log("=== Task 3: Chain Promise Operations ===\n");

// Given: Callback-based functions
function fetchUserCallback(id, callback) {
  setTimeout(() => {
    callback(null, { id, name: "Alice", postIds: [1, 2] });
  }, 100);
}

function fetchPostsCallback(userId, callback) {
  setTimeout(() => {
    callback(null, [
      { id: 1, userId, title: "First Post" },
      { id: 2, userId, title: "Second Post" },
    ]);
  }, 100);
}

function fetchCommentsCallback(postId, callback) {
  setTimeout(() => {
    callback(null, [
      { id: 1, postId, text: "Great!" },
      { id: 2, postId, text: "Thanks!" },
    ]);
  }, 100);
}

// TODO: 1. Convert each to Promise-based
function fetchUser(id) {
  // YOUR CODE HERE
}

function fetchPosts(userId) {
  // YOUR CODE HERE
}

function fetchComments(postId) {
  // YOUR CODE HERE
}

// TODO: 2. Create a function that chains them all
async function getFullUserData(userId) {
  // YOUR CODE HERE
  // Get user -> Get their posts -> Get comments for first post
  // Return object with user, posts, and comments
}

// Uncomment to test:
/*
console.log('Testing promise chain...');

getFullUserData(1)
  .then(data => {
    console.log('✅ Got user:', data.user.name);
    console.log('✅ Got posts:', data.posts.length);
    console.log('✅ Got comments:', data.comments.length);
    console.log('');
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
  });
*/

console.log("👉 Complete all functions and test the chain\n");

// ========================================
// Task 4: Generic Promisify Function
// ========================================

console.log("=== Task 4: Build a Generic Promisify Function ===\n");

console.log(
  "Challenge: Create a function that can promisify any callback function\n"
);

// TODO: Implement a generic promisify function
function promisify(fn) {
  // YOUR CODE HERE
  // Hint: Should return a function that returns a Promise
  // Should work with error-first callback pattern
}

// Uncomment to test:
/*
console.log('Testing generic promisify...');

// Test with fs.readFile
const readFileAsync = promisify(fs.readFile);
const testFile = path.join(__dirname, '../README.md');

readFileAsync(testFile, 'utf8')
  .then(content => {
    console.log('✅ Promisify works!');
    console.log('Content length:', content.length);
    console.log('');
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
  });
*/

console.log("👉 Complete promisify() and test it\n");

// ========================================
// Solution & Hints
// ========================================

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("💡 Hints");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

console.log("Task 1 Hint:");
console.log(`
function getUserPromise(userId) {
  return new Promise((resolve, reject) => {
    getUserCallback(userId, (err, user) => {
      if (err) reject(err);
      else resolve(user);
    });
  });
}
`);

console.log("Task 3 Hint:");
console.log(`
async function getFullUserData(userId) {
  const user = await fetchUser(userId);
  const posts = await fetchPosts(user.id);
  const comments = await fetchComments(posts[0].id);
  return { user, posts, comments };
}
`);

console.log("Task 4 Hint:");
console.log(`
function promisify(fn) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      fn(...args, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  };
}
`);

console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

console.log("📚 Check your solutions:");
console.log("   1. Uncomment each test section");
console.log("   2. Run the file: node exercise-1-callback-to-promise.js");
console.log("   3. All tests should pass!");
console.log("   4. Compare with hints if stuck\n");

console.log("Next: exercise-2-parallel-requests.js\n");
