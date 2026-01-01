// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Callbacks - The Foundation of Async Programming
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("📞 Understanding Callbacks");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

// ========================================
// Part 1: What is a Callback?
// ========================================

console.log("=== 1. Callback Basics ===\n");

console.log(
  "A callback is a function passed as an argument to another function.\n"
);

function greet(name, callback) {
  console.log(`Hello, ${name}!`);
  callback();
}

greet("Alice", () => {
  console.log("Callback executed after greeting\n");
});

// ========================================
// Part 2: Synchronous vs Asynchronous Callbacks
// ========================================

console.log("=== 2. Synchronous Callbacks ===\n");

const numbers = [1, 2, 3, 4, 5];

console.log("Array.map is a synchronous callback:");
const doubled = numbers.map((n) => n * 2);
console.log("Doubled:", doubled);
console.log("This runs immediately, no waiting\n");

console.log("=== 3. Asynchronous Callbacks ===\n");

console.log("setTimeout is asynchronous:");
console.log("Before setTimeout");

setTimeout(() => {
  console.log("Inside setTimeout callback (runs later)");
}, 1000);

console.log("After setTimeout (runs immediately)");
console.log("↑ Notice this runs before the callback!\n");

// Wait a bit to see the async callback execute
setTimeout(() => {
  // ========================================
  // Part 3: Error-First Callback Pattern
  // ========================================

  console.log("\n=== 4. Error-First Callback Convention ===\n");

  console.log("Node.js convention: callback(error, result)\n");

  function readUserData(userId, callback) {
    // Simulate async operation
    setTimeout(() => {
      if (userId < 1) {
        // Error case: pass error as first argument
        callback(new Error("Invalid user ID"), null);
      } else {
        // Success case: pass null for error, data as second argument
        callback(null, { id: userId, name: "Alice" });
      }
    }, 100);
  }

  console.log("Success case:");
  readUserData(1, (err, user) => {
    if (err) {
      console.error("Error:", err.message);
      return;
    }
    console.log("User data:", user);
  });

  setTimeout(() => {
    console.log("\nError case:");
    readUserData(-1, (err, user) => {
      if (err) {
        console.error("Error:", err.message);
        return;
      }
      console.log("User data:", user);
    });

    setTimeout(continueDemo, 200);
  }, 200);
}, 1500);

function continueDemo() {
  // ========================================
  // Part 4: Callback Hell (Pyramid of Doom)
  // ========================================

  console.log("\n=== 5. Callback Hell ===\n");

  console.log("What happens when you need sequential async operations:\n");

  function getUser(id, callback) {
    setTimeout(() => callback(null, { id, name: "Alice" }), 100);
  }

  function getPosts(userId, callback) {
    setTimeout(() => callback(null, [{ id: 1, title: "Post 1" }]), 100);
  }

  function getComments(postId, callback) {
    setTimeout(() => callback(null, [{ id: 1, text: "Great!" }]), 100);
  }

  console.log("Code example:");
  console.log(`
getUser(1, (err, user) => {
  if (err) return handleError(err);
  
  getPosts(user.id, (err, posts) => {
    if (err) return handleError(err);
    
    getComments(posts[0].id, (err, comments) => {
      if (err) return handleError(err);
      
      console.log('Finally got comments!', comments);
    });
  });
});
`);

  console.log("Problems with callback hell:");
  console.log("  ❌ Hard to read (indentation keeps growing)");
  console.log("  ❌ Error handling is repetitive");
  console.log("  ❌ Difficult to maintain");
  console.log("  ❌ Hard to add new steps\n");

  console.log("Actual execution:");
  getUser(1, (err, user) => {
    if (err) {
      console.error("Error:", err);
      return;
    }
    console.log("Step 1: Got user:", user.name);

    getPosts(user.id, (err, posts) => {
      if (err) {
        console.error("Error:", err);
        return;
      }
      console.log("Step 2: Got posts:", posts.length);

      getComments(posts[0].id, (err, comments) => {
        if (err) {
          console.error("Error:", err);
          return;
        }
        console.log("Step 3: Got comments:", comments.length);
        console.log("Final result:", comments);

        setTimeout(showSolutions, 100);
      });
    });
  });
}

function showSolutions() {
  // ========================================
  // Part 5: Avoiding Callback Hell
  // ========================================

  console.log("\n=== 6. Solutions to Callback Hell ===\n");

  console.log("Solution 1: Named functions");
  console.log("────────────────────────────");
  console.log(`
function handleUser(err, user) {
  if (err) return handleError(err);
  getPosts(user.id, handlePosts);
}

function handlePosts(err, posts) {
  if (err) return handleError(err);
  getComments(posts[0].id, handleComments);
}

function handleComments(err, comments) {
  if (err) return handleError(err);
  console.log(comments);
}

getUser(1, handleUser);
`);

  console.log("✅ Flatter structure");
  console.log("✅ Named functions are testable");
  console.log("✅ Better error handling\n");

  console.log("Solution 2: Promises (next example!)");
  console.log("─────────────────────────────────────");
  console.log("Promises provide even better structure for async operations\n");

  // ========================================
  // Part 6: Real-World Callback Examples
  // ========================================

  console.log("=== 7. Real-World Callback Usage ===\n");

  const fs = require("fs");
  const path = require("path");

  console.log("Example: Reading a file with callbacks");

  const tempFile = path.join(__dirname, "temp.txt");

  // Write a file first
  fs.writeFile(tempFile, "Hello from Node.js!", (err) => {
    if (err) {
      console.error("Write error:", err);
      return;
    }
    console.log("✅ File written successfully");

    // Read it back
    fs.readFile(tempFile, "utf8", (err, data) => {
      if (err) {
        console.error("Read error:", err);
        return;
      }
      console.log("✅ File content:", data);

      // Clean up
      fs.unlink(tempFile, (err) => {
        if (err) {
          console.error("Delete error:", err);
          return;
        }
        console.log("✅ File deleted\n");

        showSummary();
      });
    });
  });
}

function showSummary() {
  // ========================================
  // Summary
  // ========================================

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📝 Key Takeaways");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("✅ Callbacks are functions passed to other functions");
  console.log("✅ Error-first convention: callback(err, result)");
  console.log("✅ Always check for errors before using results");
  console.log("✅ Callback hell makes code hard to read");
  console.log("✅ Named functions help flatten callback hell");
  console.log("✅ Promises and async/await solve callback hell better\n");

  console.log("⚠️  Remember: Callbacks still exist in many Node.js APIs");
  console.log("    You need to know them even if you prefer Promises!\n");

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("Next: Run 02-promises-fundamentals.js to see the solution!\n");
}
