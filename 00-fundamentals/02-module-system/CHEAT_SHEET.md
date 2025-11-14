# 📚 Module System Cheat Sheet

Quick reference for CommonJS and ES Modules in Node.js.

---

## CommonJS (CJS)

### Exporting

```javascript
// Single export
module.exports = function () {};

// Multiple exports (Method 1)
module.exports = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
};

// Multiple exports (Method 2)
exports.add = (a, b) => a + b;
exports.subtract = (a, b) => a - b;

// ⚠️ Don't do this (breaks reference):
exports = { add, subtract }; // ❌ Won't work!
```

### Importing

```javascript
// Import entire module
const math = require("./math");
math.add(1, 2);

// Destructure
const { add, subtract } = require("./math");
add(1, 2);

// Dynamic require
const moduleName = "./math";
const math = require(moduleName); // ✅ Works!

// Conditional require
if (isDev) {
  const devTools = require("./dev-tools"); // ✅ Works!
}
```

---

## ES Modules (ESM)

### Exporting

```javascript
// Named exports (can have multiple)
export const PI = 3.14159;
export function add(a, b) { return a + b; }
export class Calculator { }

// Export list
const multiply = (a, b) => a * b;
const divide = (a, b) => a / b;
export { multiply, divide };

// Export with rename
const pow = (a, b) => Math.pow(a, b);
export { pow as power };

// Default export (only one per file)
export default function calculator() { }
export default class Calculator { }
export default { add, subtract };

// Mix both
export const version = '1.0.0';
export default class Calculator { }
```

### Importing

```javascript
// Import named exports
import { add, subtract } from "./math.mjs";

// Import with rename
import { add as addition } from "./math.mjs";

// Import all
import * as math from "./math.mjs";
math.add(1, 2);

// Import default
import Calculator from "./calculator.mjs";

// Mix named + default
import Calculator, { add, PI } from "./math.mjs";

// Side effects only
import "./setup.mjs";

// Dynamic import (async)
const module = await import("./module.mjs");

// ⚠️ Must use file extension in Node.js:
import { add } from "./math.mjs"; // ✅
import { add } from "./math"; // ❌ Error!
```

---

## File Extensions

```javascript
// CommonJS
.js   // Default (CommonJS unless "type": "module")
.cjs  // Always CommonJS

// ES Modules
.mjs  // Always ESM
.js   // ESM if package.json has "type": "module"
```

---

## package.json Configuration

### Basic Setup

```json
{
  "type": "module"
}
```

Now `.js` files are treated as ESM!

### Conditional Exports

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}
```

### Subpath Exports

```json
{
  "exports": {
    ".": "./index.js",
    "./utils": "./src/utils.js",
    "./utils/*": "./src/utils/*.js"
  }
}
```

---

## Module Caching

### CommonJS

```javascript
// First require - executes and caches
const mod1 = require("./module");

// Second require - returns cached version
const mod2 = require("./module");

console.log(mod1 === mod2); // true

// Clear cache (hot-reload)
delete require.cache[require.resolve("./module")];
const fresh = require("./module"); // Re-executes!
```

### ES Modules

```javascript
// Also cached, but no way to clear!
import module1 from "./module.mjs";
import module2 from "./module.mjs";
// module1 === module2 (same instance)

// "Clear" cache (hacky)
import(`./module.mjs?t=${Date.now()}`);
```

---

## Circular Dependencies

### Problem

```javascript
// a.js
const b = require("./b");
module.exports = { name: "A", friend: b };

// b.js
const a = require("./a"); // Gets partial/incomplete A!
module.exports = { name: "B", friend: a };
```

### Solution 1: Restructure

```javascript
// shared.js
module.exports = { helper };

// a.js
const shared = require("./shared");

// b.js
const shared = require("./shared");
```

### Solution 2: Lazy Loading

```javascript
// a.js
function useB() {
  const b = require("./b"); // Load when needed
  return b.doSomething();
}
```

---

## ESM Special Features

### Top-Level Await

```javascript
// Only works in ESM!
const response = await fetch("https://api.example.com");
const data = await response.json();
```

### import.meta

```javascript
// Current module URL
console.log(import.meta.url);
// file:///path/to/module.mjs

// Get __dirname and __filename equivalents
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

---

## Interoperability

### Import CJS in ESM

```javascript
// ✅ Works!
import cjsModule from "./commonjs-module.js";

// Named imports from CJS (sometimes works)
import { named } from "./commonjs-module.js";
```

### Import ESM in CJS

```javascript
// ❌ Can't use import in CJS

// ✅ Use dynamic import (async)
async function load() {
  const esmModule = await import("./esm-module.mjs");
  return esmModule.default;
}
```

---

## Quick Decision Guide

**Use CommonJS when:**

- Working with older Node.js codebases
- Need dynamic requires
- Don't need browser compatibility

**Use ES Modules when:**

- Starting a new project
- Need top-level await
- Want better tree-shaking
- Need browser compatibility
- Following modern best practices

**Use Dual Package when:**

- Publishing to npm
- Need to support both ecosystems
- Building a library

---

## Common Gotchas

### ❌ exports = { } doesn't work

```javascript
// ❌ WRONG
exports = { add, subtract };

// ✅ CORRECT
module.exports = { add, subtract };
```

### ❌ Missing file extension in ESM

```javascript
// ❌ WRONG (in ESM)
import { add } from "./math";

// ✅ CORRECT
import { add } from "./math.mjs";
```

### ❌ Top-level await in CommonJS

```javascript
// ❌ WRONG (in CJS)
const data = await fetch("...");

// ✅ CORRECT (use async function)
async function load() {
  const data = await fetch("...");
}
```

### ❌ \_\_dirname in ESM

```javascript
// ❌ WRONG (not available in ESM)
console.log(__dirname);

// ✅ CORRECT
import { fileURLToPath } from "url";
import { dirname } from "path";
const __dirname = dirname(fileURLToPath(import.meta.url));
```

---

## Debugging Commands

```bash
# Find where a module resolves to
node -e "console.log(require.resolve('express'))"

# Check if a file is ESM or CJS
node --input-type=module -e "import './file.js'"

# List all cached modules
node -e "console.log(Object.keys(require.cache))"

# Find circular dependencies
npx madge --circular src/
```

---

**🎯 Remember:** ESM is the future, but CommonJS is still widely used. Know both!
