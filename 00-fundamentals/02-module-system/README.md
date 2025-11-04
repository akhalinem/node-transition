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

**Status**: 📝 Materials coming soon - Placeholder for now

*You can start with the runtime architecture and come back to this, or research these topics independently using the resources above.*
