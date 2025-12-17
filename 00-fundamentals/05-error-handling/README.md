# Error Handling Patterns

**Time Required**: 2-3 hours  
**Difficulty**: ⭐⭐⭐  
**Importance**: 🔥🔥🔥

---

## 🎯 Learning Objectives

By the end of this module, you'll understand:

- Synchronous vs asynchronous error handling
- Try-catch blocks and their limitations
- Error-first callbacks pattern
- Promise rejection handling
- Custom error classes and error hierarchies
- Error propagation and boundaries
- Best practices for production error handling

---

## � Topics Covered

### 1. Synchronous Error Handling

- Try-catch blocks
- Throwing errors
- Error objects and stack traces
- When synchronous errors occur

### 2. Asynchronous Error Handling

- Error-first callbacks (Node.js convention)
- Promise rejections and `.catch()`
- Async/await with try-catch
- Unhandled rejections

### 3. Custom Error Classes

- Extending the Error class
- Custom error properties
- Error hierarchies for different scenarios
- Operational vs programmer errors

### 4. Error Propagation

- Error bubbling in async contexts
- Error boundaries
- Centralized error handling
- Domain-specific error handling

### 5. Production Best Practices

- Logging errors effectively
- Error monitoring and alerting
- Graceful degradation
- User-friendly error messages

---

## 🛠️ Practice

### Examples

Check the `examples/` folder for:

- Synchronous error handling
- Async error patterns (callbacks, promises, async/await)
- Custom error classes
- Error propagation strategies
- Production-ready error handling

### Exercises

Complete the exercises in `exercises/` folder:

1. Implement robust error handling in async code
2. Create a custom error hierarchy
3. Build an error handling middleware

---

## ✅ Self-Check

Before moving on, can you answer:

- [ ] When does try-catch NOT catch errors?
- [ ] What's the error-first callback pattern?
- [ ] How do you handle unhandled promise rejections?
- [ ] What's the difference between operational and programmer errors?
- [ ] How should you propagate errors in async functions?
- [ ] What information should error objects contain?

---

## 📖 Resources

- [Node.js Error Handling](https://nodejs.org/api/errors.html)
- [Promise Error Handling](https://nodejs.org/api/process.html#process_event_unhandledrejection)
- [Error Handling Best Practices](https://www.joyent.com/node-js/production/design/errors)

---

## 🚀 Getting Started

### Step 1: Run the Examples (40-50 min)

```bash
# Navigate to examples folder
cd examples/

# Basic synchronous error handling
node 01-sync-errors.js

# Async error patterns
node 02-callback-errors.js
node 03-promise-errors.js
node 04-async-await-errors.js

# Custom error classes
node 05-custom-errors.js

# Error propagation
node 06-error-propagation.js

# Production patterns
node 07-production-errors.js
```

### Step 2: Complete the Exercises (70-90 min)

```bash
cd exercises/

# Exercise 1: Handle Complex Async Errors (⭐⭐)
node exercise-1-async-errors.js

# Exercise 2: Build Custom Error Hierarchy (⭐⭐⭐)
node exercise-2-error-hierarchy.js

# Exercise 3: Error Handling Middleware (⭐⭐⭐)
node exercise-3-error-middleware.js
```

---

## 🎓 Learning Path

1. **Master Synchronous Errors First**

   - Understand try-catch mechanics
   - Learn about Error objects
   - Practice throwing and catching

2. **Tackle Async Complexity**

   - Error-first callbacks
   - Promise rejection handling
   - Async/await error patterns

3. **Build Robust Error Classes**

   - Create custom errors
   - Build error hierarchies
   - Add context to errors

4. **Implement Production Patterns**
   - Centralized error handling
   - Logging and monitoring
   - Graceful degradation

---

## 📊 Error Handling Quick Reference

| Context            | Pattern                  | Example                           |
| ------------------ | ------------------------ | --------------------------------- |
| **Sync code**      | try-catch                | `try { ... } catch (err) { ... }` |
| **Callbacks**      | Error-first parameter    | `(err, data) => { if (err) ... }` |
| **Promises**       | .catch()                 | `promise.catch(err => ...)`       |
| **Async/await**    | try-catch around await   | `try { await ... } catch { ... }` |
| **Event Emitters** | 'error' event listener   | `emitter.on('error', ...)`        |
| **Streams**        | 'error' event + pipeline | `pipeline(..., err => ...)`       |

---

## ⚠️ Common Pitfalls

1. **Not catching async errors** - Try-catch doesn't work with callbacks
2. **Swallowing errors** - Always log or propagate errors
3. **Mixing error patterns** - Be consistent (callbacks vs promises)
4. **Missing unhandledRejection handler** - Can crash your app
5. **Generic error messages** - Provide context and actionable info
6. **Not using error codes** - Hard to programmatically handle errors

---

## 🔑 Key Takeaways

- **Sync errors**: Use try-catch
- **Async errors**: Different patterns for callbacks, promises, and async/await
- **Always propagate**: Don't swallow errors silently
- **Add context**: Error messages should be descriptive and actionable
- **Custom classes**: Create domain-specific error types
- **Handle unhandled**: Set up global handlers for uncaught errors
- **Log properly**: Include stack traces and context in production

---
