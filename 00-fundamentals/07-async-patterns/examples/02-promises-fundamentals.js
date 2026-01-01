// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Promises - A Better Way to Handle Async Operations
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("🤝 Understanding Promises");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

// ========================================
// Part 1: What is a Promise?
// ========================================

console.log("=== 1. Promise Basics ===\n");

console.log("A Promise represents a value that may be available now,");
console.log("in the future, or never (if it fails).\n");

console.log("Three states:");
console.log("  • Pending   - Initial state, neither fulfilled nor rejected");
console.log("  • Fulfilled - Operation completed successfully");
console.log("  • Rejected  - Operation failed\n");

// ========================================
// Part 2: Creating Promises
// ========================================

console.log("=== 2. Creating a Promise ===\n");

const simplePromise = new Promise((resolve, reject) => {
  console.log("Inside Promise executor (runs immediately)");

  // Simulate async operation
  setTimeout(() => {
    const success = true;

    if (success) {
      resolve("Operation succeeded!"); // Fulfill the promise
    } else {
      reject(new Error("Operation failed!")); // Reject the promise
    }
  }, 1000);
});

console.log("Promise created (state: pending)\n");

// Consume the promise
simplePromise
  .then((result) => {
    console.log("✅ Promise fulfilled:", result);
    console.log("State changed to: fulfilled\n");
    continueDemo();
  })
  .catch((error) => {
    console.error("❌ Promise rejected:", error.message);
  });

function continueDemo() {
  // ========================================
  // Part 3: Promise Chaining
  // ========================================

  console.log("=== 3. Promise Chaining ===\n");

  console.log("Promises can be chained to avoid callback hell:\n");

  function getUser(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id, name: "Alice", postIds: [1, 2, 3] });
      }, 100);
    });
  }

  function getPosts(userId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, userId, title: "First Post" },
          { id: 2, userId, title: "Second Post" },
        ]);
      }, 100);
    });
  }

  function getComments(postId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, postId, text: "Great post!" },
          { id: 2, postId, text: "Thanks for sharing!" },
        ]);
      }, 100);
    });
  }

  console.log("Chained Promise execution:");

  getUser(1)
    .then((user) => {
      console.log("Step 1: Got user:", user.name);
      return getPosts(user.id); // Return a promise
    })
    .then((posts) => {
      console.log("Step 2: Got posts:", posts.length);
      return getComments(posts[0].id); // Return another promise
    })
    .then((comments) => {
      console.log("Step 3: Got comments:", comments.length);
      console.log("Final result:", comments);
      console.log("\n✅ Much cleaner than callback hell!\n");

      setTimeout(showErrorHandling, 100);
    })
    .catch((error) => {
      console.error("Error in chain:", error);
    });
}

function showErrorHandling() {
  // ========================================
  // Part 4: Error Handling
  // ========================================

  console.log("=== 4. Error Handling ===\n");

  console.log("Single .catch() handles errors from entire chain:\n");

  function failingOperation(shouldFail) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldFail) {
          reject(new Error("Something went wrong!"));
        } else {
          resolve("Success!");
        }
      }, 100);
    });
  }

  // Success case
  console.log("Success case:");
  failingOperation(false)
    .then((result) => {
      console.log("✅", result);
      return "Next step";
    })
    .then((result) => {
      console.log("✅", result);
    })
    .catch((error) => {
      console.error("❌ Error caught:", error.message);
    })
    .finally(() => {
      console.log("🔚 Finally block always runs\n");

      // Error case
      console.log("Error case:");
      failingOperation(true)
        .then((result) => {
          console.log("This won't run");
          return "Neither will this";
        })
        .then((result) => {
          console.log("Or this");
        })
        .catch((error) => {
          console.error("❌ Error caught:", error.message);
          console.log("   ↑ Skipped all .then() handlers\n");
        })
        .finally(() => {
          console.log("🔚 Finally still runs\n");
          setTimeout(showStaticMethods, 100);
        });
    });
}

function showStaticMethods() {
  // ========================================
  // Part 5: Promise Static Methods
  // ========================================

  console.log("=== 5. Promise Static Methods ===\n");

  // Promise.resolve()
  console.log("Promise.resolve() - Create fulfilled promise:");
  Promise.resolve("Instant success!").then((value) => {
    console.log("✅", value, "\n");

    // Promise.reject()
    console.log("Promise.reject() - Create rejected promise:");
    Promise.reject(new Error("Instant failure!")).catch((error) => {
      console.error("❌", error.message, "\n");

      setTimeout(showPromisifyPattern, 100);
    });
  });
}

function showPromisifyPattern() {
  // ========================================
  // Part 6: Converting Callbacks to Promises
  // ========================================

  console.log("=== 6. Promisifying Callbacks ===\n");

  const fs = require("fs");
  const { promisify } = require("util");
  const path = require("path");

  console.log("Method 1: Manual promisification");
  console.log("─────────────────────────────────\n");

  function readFilePromise(filename, encoding) {
    return new Promise((resolve, reject) => {
      fs.readFile(filename, encoding, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  const tempFile = path.join(__dirname, "promise-temp.txt");

  // Create temp file
  fs.writeFileSync(tempFile, "Hello Promises!");

  console.log("Reading file with manual promise:");
  readFilePromise(tempFile, "utf8")
    .then((data) => {
      console.log("✅ Content:", data, "\n");

      console.log("Method 2: Using util.promisify (easier!)");
      console.log("───────────────────────────────────────────\n");

      const readFileAsync = promisify(fs.readFile);
      const unlinkAsync = promisify(fs.unlink);

      return readFileAsync(tempFile, "utf8")
        .then((data) => {
          console.log("✅ Content:", data);
          return unlinkAsync(tempFile);
        })
        .then(() => {
          console.log("✅ File cleaned up\n");
          setTimeout(showAdvancedPatterns, 100);
        });
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function showAdvancedPatterns() {
  // ========================================
  // Part 7: Advanced Promise Patterns
  // ========================================

  console.log("=== 7. Advanced Patterns ===\n");

  // Returning values vs promises
  console.log("Pattern 1: Returning values in .then()");
  console.log("────────────────────────────────────────\n");

  Promise.resolve(5)
    .then((num) => {
      console.log("Got:", num);
      return num * 2; // Return a value
    })
    .then((num) => {
      console.log("Doubled:", num);
      return Promise.resolve(num + 10); // Return a promise
    })
    .then((num) => {
      console.log("Added 10:", num);
      console.log("✅ Both return types work in chains!\n");

      showRecoveryPattern();
    });
}

function showRecoveryPattern() {
  console.log("Pattern 2: Error Recovery");
  console.log("──────────────────────────\n");

  Promise.reject(new Error("Initial error"))
    .catch((error) => {
      console.log("❌ Caught error:", error.message);
      console.log("⚡ Recovering from error...");
      return "Recovered value"; // Recovery!
    })
    .then((value) => {
      console.log("✅ Chain continues:", value);
      console.log("   ↑ Error was handled, chain recovered!\n");

      showNestedPromises();
    });
}

function showNestedPromises() {
  console.log("Pattern 3: Avoid Nested Promises");
  console.log("──────────────────────────────────\n");

  function getUserData(id) {
    return Promise.resolve({ id, name: "Bob" });
  }

  function getUserPosts(userId) {
    return Promise.resolve([{ id: 1, title: "Post" }]);
  }

  console.log("❌ BAD - Nested promises (like callback hell):");
  console.log(`
getUserData(1).then(user => {
  getUserPosts(user.id).then(posts => {
    console.log(posts); // Nested!
  });
});
`);

  console.log("✅ GOOD - Flat promise chain:");
  console.log(`
getUserData(1)
  .then(user => getUserPosts(user.id))
  .then(posts => console.log(posts));
`);

  getUserData(1)
    .then((user) => getUserPosts(user.id))
    .then((posts) => {
      console.log("\nActual result:", posts, "\n");

      setTimeout(showSummary, 100);
    });
}

function showSummary() {
  // ========================================
  // Summary
  // ========================================

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📝 Key Takeaways");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("✅ Promises have 3 states: pending, fulfilled, rejected");
  console.log("✅ Create with: new Promise((resolve, reject) => {})");
  console.log("✅ Consume with: .then(), .catch(), .finally()");
  console.log("✅ Chain promises to avoid callback hell");
  console.log("✅ .catch() handles any error in the chain");
  console.log("✅ .finally() always runs (cleanup code)");
  console.log("✅ Return promises or values in .then()");
  console.log("✅ Use promisify() to convert callbacks");
  console.log("✅ Avoid nested promises (keep chains flat)\n");

  console.log("⚡ Promises are better than callbacks, but...");
  console.log("   async/await makes them even easier!\n");

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("Next: Run 03-async-await.js for the modern approach!\n");
}
