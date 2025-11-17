# 📦 String Utils - TypeScript Support Guide

Your `string-utils` package now has full TypeScript support via `.d.ts` declaration files!

---

## 🎯 What's Been Added

### TypeScript Declaration Files

```
src/
├── case.d.ts          # Type definitions for case utilities
├── validation.d.ts    # Type definitions for validation utilities
└── index.d.ts         # Main entry point types
```

### Updated package.json

```json
{
  "types": "./src/index.d.ts",
  "exports": {
    ".": {
      "types": "./src/index.d.ts", // ← TypeScript will find this
      "import": "./src/index.mjs",
      "require": "./src/index.cjs"
    }
  }
}
```

---

## ✅ Benefits

### 1. IntelliSense in VS Code

When you import functions, you get:

- Auto-completion
- Parameter hints
- Return type information
- JSDoc documentation

### 2. Type Checking

TypeScript will catch errors:

```typescript
import { capitalize } from "string-utils";

capitalize(123); // ❌ Error: number not assignable to string
capitalize("hello"); // ✅ OK
```

### 3. Works with JavaScript Too!

Even in `.js` files, VS Code will use the type definitions for IntelliSense!

```javascript
// In a .js file with JSDoc:
import { capitalize } from "string-utils";

const result = capitalize("hello"); // VS Code knows this returns string
```

---

## 🧪 Testing TypeScript Support

### Option 1: Type Check (No Compilation)

```bash
# Install TypeScript globally
npm install -g typescript

# Check types without compiling
tsc --noEmit test/test-types.ts
```

### Option 2: Use in VS Code

1. Open `test/test-types.ts` in VS Code
2. Hover over any function to see documentation
3. Type `capitalize(` and see parameter hints
4. Uncomment error examples to see red squiggles

### Option 3: Use in Your Own TypeScript Project

```typescript
// your-project/src/index.ts
import { capitalize, isEmail } from "string-utils";

const name = capitalize("john doe");
const valid = isEmail("test@example.com");
```

---

## 📚 Declaration File Anatomy

### Example: case.d.ts

````typescript
/**
 * Converts a string to camelCase.
 * @param str - The string to convert
 * @returns The camelCase string
 * @example
 * ```ts
 * camelCase('hello-world'); // 'helloWorld'
 * ```
 */
export function camelCase(str: string): string;
````

This provides:

- **Function signature**: `camelCase(str: string): string`
- **Documentation**: Shows in IntelliSense
- **Examples**: Help users understand usage

---

## 🎨 Advanced: Publishing to npm

When you publish this package to npm, TypeScript users will automatically get:

1. **Type checking** for your functions
2. **IntelliSense** in their editor
3. **Documentation** from JSDoc comments

### What npm Users See

```typescript
// Their TypeScript project
import { capitalize } from "string-utils"; // Types auto-loaded!

const result = capitalize("hello");
//    ^? const result: string
```

---

## 🔧 Maintenance

### When Adding New Functions

1. **Add to .cjs and .mjs files** (implementation)
2. **Add to .d.ts file** (type definition)
3. **Update exports in package.json**

Example - Adding `titleCase`:

```typescript
// src/case.d.ts
export function titleCase(str: string): string;

// src/case.cjs
const titleCase = (str) => {
  return str.split(' ').map(capitalize).join(' ');
};
module.exports = { /* ... */, titleCase };

// src/case.mjs
export function titleCase(str) {
  return str.split(' ').map(capitalize).join(' ');
}
```

---

## 📊 Package Structure

```
string-utils/
├── package.json           # With "types" field
├── README.md              # This file
├── src/
│   ├── index.cjs          # CommonJS implementation
│   ├── index.mjs          # ESM implementation
│   ├── index.d.ts         # TypeScript definitions ✨
│   ├── case.cjs
│   ├── case.mjs
│   ├── case.d.ts          # ✨
│   ├── validation.cjs
│   ├── validation.mjs
│   └── validation.d.ts    # ✨
└── test/
    ├── test-cjs.cjs       # CommonJS tests
    ├── test-esm.mjs       # ESM tests
    └── test-types.ts      # TypeScript tests ✨
```

---

## 💡 Why .d.ts Files?

### Alternative 1: Write in TypeScript

```typescript
// src/case.ts
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
```

- ✅ Type-safe source code
- ❌ Need build step (tsc)
- ❌ Need to maintain build configuration

### Alternative 2: Use JSDoc in JavaScript

```javascript
/**
 * @param {string} str
 * @returns {string}
 */
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
```

- ✅ No build step
- ⚠️ Less precise than TypeScript
- ⚠️ Can get verbose

### ✅ Our Approach: Separate .d.ts Files

```javascript
// case.cjs - Clean implementation
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

// case.d.ts - Type definitions
export function capitalize(str: string): string;
```

- ✅ No build step needed
- ✅ Clean source code
- ✅ Full TypeScript support
- ✅ Easy to maintain

---

## 🎯 Key Takeaways

✅ Your package supports both JavaScript and TypeScript users  
✅ No build step required - just add .d.ts files  
✅ IntelliSense works in VS Code for everyone  
✅ Type checking for TypeScript users  
✅ JSDoc comments provide inline documentation  
✅ Works with both CommonJS and ES Modules

---

**🎉 Your package is now TypeScript-friendly!**
