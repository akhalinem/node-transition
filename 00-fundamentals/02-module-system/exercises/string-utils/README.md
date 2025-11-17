# 📦 String Utils

A comprehensive, lightweight string utilities library with **TypeScript** and **browser** support.

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourusername/string-utils)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## ✨ Features

- ✅ **Dual Package**: Works with both CommonJS and ES Modules
- ✅ **TypeScript Support**: Full type definitions included
- ✅ **Browser Ready**: UMD and ESM builds for browsers
- ✅ **Tiny**: ~1.5KB minified
- ✅ **Zero Dependencies**: No external dependencies
- ✅ **Well Tested**: Comprehensive test coverage

---

## 📦 Installation

```bash
npm install string-utils
# or
yarn add string-utils
# or
pnpm add string-utils
```

---

## 🚀 Quick Start

### Node.js (CommonJS)

```javascript
const { capitalize, isEmail } = require("string-utils");

capitalize("hello world"); // "Hello world"
isEmail("test@example.com"); // true
```

### Node.js (ES Modules)

```javascript
import { capitalize, isEmail } from "string-utils";

capitalize("hello world"); // "Hello world"
isEmail("test@example.com"); // true
```

### Browser (Script Tag)

```html
<script src="https://unpkg.com/string-utils/dist/string-utils.min.js"></script>
<script>
  StringUtils.capitalize("hello"); // "Hello"
</script>
```

### Browser (ES Module)

```html
<script type="module">
  import { capitalize } from "https://unpkg.com/string-utils/dist/string-utils.esm.js";
  capitalize("hello"); // "Hello"
</script>
```

### TypeScript

```typescript
import { capitalize, isEmail } from "string-utils";

const name: string = capitalize("john doe");
const valid: boolean = isEmail("test@example.com");
```

---

## 📚 API Reference

### Case Conversion

#### `capitalize(str: string): string`

Capitalizes the first letter of a string.

```javascript
capitalize("hello world"); // "Hello world"
```

#### `toUpperCase(str: string): string`

Converts string to uppercase.

```javascript
toUpperCase("hello"); // "HELLO"
```

#### `toLowerCase(str: string): string`

Converts string to lowercase.

```javascript
toLowerCase("HELLO"); // "hello"
```

#### `camelCase(str: string): string`

Converts string to camelCase.

```javascript
camelCase("hello-world"); // "helloWorld"
camelCase("hello_world"); // "helloWorld"
```

#### `kebabCase(str: string): string`

Converts string to kebab-case.

```javascript
kebabCase("helloWorld"); // "hello-world"
kebabCase("hello_world"); // "hello-world"
```

#### `snakeCase(str: string): string`

Converts string to snake_case.

```javascript
snakeCase("helloWorld"); // "hello_world"
snakeCase("hello-world"); // "hello_world"
```

### Validation

#### `isEmail(str: string): boolean`

Validates if string is a valid email address.

```javascript
isEmail("test@example.com"); // true
isEmail("invalid"); // false
```

#### `isURL(str: string): boolean`

Validates if string is a valid URL.

```javascript
isURL("https://example.com"); // true
isURL("not a url"); // false
```

#### `isUUID(str: string): boolean`

Validates if string is a valid UUID.

```javascript
isUUID("550e8400-e29b-41d4-a716-446655440000"); // true
isUUID("not-a-uuid"); // false
```

#### `isEmpty(str: string): boolean`

Checks if string is empty.

```javascript
isEmpty(""); // true
isEmpty("hello"); // false
```

#### `hasMinLength(str: string, min: number): boolean`

Checks if string meets minimum length.

```javascript
hasMinLength("hello", 3); // true
hasMinLength("hi", 5); // false
```

---

## 📖 Subpath Exports

Import specific utilities for better tree-shaking:

```javascript
// Import only case utilities
import { capitalize, camelCase } from "string-utils/case";

// Import only validation utilities
import { isEmail, isURL } from "string-utils/validation";
```

---

## 🌐 Browser Support

Works in all modern browsers and IE11+:

| Browser | UMD    | ESM    |
| ------- | ------ | ------ |
| Chrome  | ✅ All | ✅ 61+ |
| Firefox | ✅ All | ✅ 60+ |
| Safari  | ✅ All | ✅ 11+ |
| Edge    | ✅ All | ✅ 16+ |
| IE 11   | ✅ Yes | ❌ No  |

See [BROWSER.md](BROWSER.md) for detailed browser usage guide.

---

## 📘 TypeScript

Full TypeScript support with `.d.ts` files included:

```typescript
import { capitalize, isEmail } from "string-utils";

// Full type inference
const name: string = capitalize("john");
const valid: boolean = isEmail("test@example.com");

// Type checking
capitalize(123); // ❌ Error: number not assignable to string
```

See [TYPESCRIPT.md](TYPESCRIPT.md) for detailed TypeScript guide.

---

## 📦 Package Structure

```
string-utils/
├── src/
│   ├── index.cjs           # CommonJS entry
│   ├── index.mjs           # ES Module entry
│   ├── index.d.ts          # TypeScript definitions
│   ├── case.cjs/mjs/d.ts   # Case utilities
│   └── validation.cjs/mjs/d.ts  # Validation utilities
├── dist/
│   ├── string-utils.js      # UMD build
│   ├── string-utils.esm.js  # ES Module for browsers
│   └── string-utils.min.js  # Minified UMD
├── test/
│   ├── test-cjs.cjs         # CommonJS tests
│   ├── test-esm.mjs         # ESM tests
│   └── test-types.ts        # TypeScript tests
└── examples/
    ├── browser-script-tag.html
    ├── browser-esm.html
    └── browser-cdn.html
```

---

## 🧪 Testing

```bash
# Run CommonJS tests
node test/test-cjs.cjs

# Run ESM tests
node test/test-esm.mjs

# Type check TypeScript
tsc --noEmit test/test-types.ts

# Open browser examples
open examples/browser-script-tag.html
```

---

## 📊 Bundle Size

| File     | Size   | Gzipped |
| -------- | ------ | ------- |
| UMD      | 3.2 KB | 1.2 KB  |
| ESM      | 2.8 KB | 1.1 KB  |
| Minified | 1.5 KB | 0.7 KB  |

---

## 🎯 Use Cases

### Form Validation

```javascript
import { isEmail, hasMinLength, isEmpty } from "string-utils";

function validateForm(data) {
  if (isEmpty(data.name)) {
    return { valid: false, error: "Name is required" };
  }

  if (!hasMinLength(data.name, 2)) {
    return { valid: false, error: "Name too short" };
  }

  if (!isEmail(data.email)) {
    return { valid: false, error: "Invalid email" };
  }

  return { valid: true };
}
```

### URL Slug Generation

```javascript
import { kebabCase } from "string-utils/case";

function createSlug(title) {
  return kebabCase(title);
}

createSlug("My Blog Post 2024"); // "my-blog-post-2024"
```

### API Response Formatting

```javascript
import { camelCase, snakeCase } from "string-utils/case";

function transformKeys(obj, transformer) {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    acc[transformer(key)] = value;
    return acc;
  }, {});
}

// Server uses snake_case
const serverData = { user_name: "John", email_address: "john@example.com" };

// Convert to camelCase for frontend
const clientData = transformKeys(serverData, camelCase);
// { userName: 'John', emailAddress: 'john@example.com' }
```

---

## 📚 Documentation

- [Browser Support Guide](BROWSER.md) - Detailed browser usage
- [TypeScript Guide](TYPESCRIPT.md) - TypeScript integration
- [Quick Start Guide](QUICK_START.md) - Get started quickly

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines.

---

## 📄 License

MIT © [Your Name]

---

## 🔗 Links

- [GitHub Repository](https://github.com/yourusername/string-utils)
- [npm Package](https://www.npmjs.com/package/string-utils)
- [Documentation](https://yourusername.github.io/string-utils)
- [Issues](https://github.com/yourusername/string-utils/issues)

---

**Made with ❤️ for the JavaScript community**
