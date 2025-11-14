# Module System - CommonJS vs ES Modules

**Time Required**: 2-3 hours  
**Difficulty**: ⭐⭐

---

## 🎯 Learning Objectives

By the end of this module, you'll understand:

- The difference between CommonJS and ES Modules
- When to use `require()` vs `import`
- How module caching works
- Module resolution algorithm
- How to handle circular dependencies
- Package.json `exports` and `imports` fields

---

## 📚 Topics Covered

### 1. CommonJS (Traditional Node.js)

- `require()` and `module.exports`
- `module` object and `exports` shorthand
- Module caching behavior
- Dynamic require

### 2. ES Modules (Modern JavaScript)

- `import` and `export` syntax
- Named vs default exports
- Static vs dynamic imports
- Top-level await

### 3. Differences & Migration

- Syntax differences
- Loading behavior differences
- Interoperability between CJS and ESM
- When to use which system

### 4. Module Resolution

- Node.js module resolution algorithm
- File extensions (.js, .mjs, .cjs)
- Package.json configuration
- Conditional exports

---

## 🛠️ Practice

### Examples

Check the `examples/` folder for:

- Basic CommonJS usage
- Basic ESM usage
- Module caching demonstration
- Circular dependency examples

### Exercises

Complete the exercises in `exercises/` folder:

1. Convert a CommonJS module to ESM
2. Implement proper circular dependency handling
3. Create a module with conditional exports

---

## ✅ Self-Check

Before moving on, can you answer:

- [ ] What's the difference between `require()` and `import`?
- [ ] How does module caching work?
- [ ] What happens in a circular dependency?
- [ ] When should you use .mjs vs .cjs?
- [ ] What is `package.json` `"type": "module"`?

---

## 📖 Resources

- [Node.js Modules Documentation](https://nodejs.org/api/modules.html)
- [ES Modules Documentation](https://nodejs.org/api/esm.html)
- [Package.json exports field](https://nodejs.org/api/packages.html#exports)

---

## 🚀 Getting Started

### Step 1: Run the Examples (30-40 min)

```bash
# Navigate to examples folder
cd examples/

# Start with CommonJS basics
node 01-commonjs-basics.js

# Then ES Modules (note the .mjs extension!)
node 02-esm-basics.mjs

# Module caching demonstration
node 03-module-caching.js

# Circular dependencies (the tricky part!)
node 04-circular-dependencies.js

# Module resolution algorithm
node 05-module-resolution.js
```

### Step 2: Complete the Exercises (60-90 min)

```bash
cd exercises/

# Exercise 1: Convert CommonJS to ESM (⭐⭐)
node exercise-1-cjs-to-esm.js
# Read instructions, then create your solution files

# Exercise 2: Fix Circular Dependencies (⭐⭐⭐)
node exercise-2-circular-deps.js
# Creates test files, then you fix them!

# Exercise 3: Dual Package with Exports (⭐⭐⭐)
node exercise-3-dual-package.js
# Build a real-world dual CJS/ESM package
```

---

## 🎓 Learning Path

1. **Start with CommonJS** (most Node.js code still uses it)

   - Understand require() and module.exports
   - Learn about module caching
   - See how circular dependencies work

2. **Then move to ESM** (the future of JavaScript)

   - Compare import/export syntax
   - Use top-level await
   - Understand the differences

3. **Practice module resolution**

   - How Node.js finds modules
   - package.json configuration
   - Conditional exports

4. **Handle real-world scenarios**
   - Convert CJS to ESM
   - Fix circular dependencies
   - Create dual packages

---

## 📊 Quick Comparison

| Feature             | CommonJS                       | ES Modules          |
| ------------------- | ------------------------------ | ------------------- |
| **Syntax**          | `require()` / `module.exports` | `import` / `export` |
| **Loading**         | Synchronous                    | Asynchronous        |
| **Dynamic**         | ✅ Yes (`require(variable)`)   | ⚠️ Via `import()`   |
| **Top-level await** | ❌ No                          | ✅ Yes              |
| **File ext**        | `.js` (default)                | `.mjs` or config    |
| **Browser**         | ❌ No                          | ✅ Yes              |
| **Tree-shaking**    | ❌ No                          | ✅ Yes              |

---
