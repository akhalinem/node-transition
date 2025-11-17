# 🌐 Browser Support Guide

Your string-utils package now works in browsers! Here's everything you need to know.

---

## 📦 What's Included

### Browser Builds

```
dist/
├── string-utils.js        # UMD build (works everywhere)
├── string-utils.esm.js    # ES Module for modern browsers
└── string-utils.min.js    # Minified UMD (~1.5KB)
```

### Build Formats

| Format       | File                | Usage                    | Browser Support      |
| ------------ | ------------------- | ------------------------ | -------------------- |
| **UMD**      | string-utils.js     | `<script>` tag           | All browsers (IE11+) |
| **ESM**      | string-utils.esm.js | `<script type="module">` | Modern browsers      |
| **Minified** | string-utils.min.js | Production               | All browsers         |

---

## 🚀 Usage Methods

### Method 1: Script Tag (Universal)

```html
<!DOCTYPE html>
<html>
  <body>
    <script src="path/to/string-utils.js"></script>
    <script>
      // StringUtils is now available globally
      const result = StringUtils.capitalize("hello world");
      console.log(result); // "Hello world"
    </script>
  </body>
</html>
```

**Pros:**

- ✅ Works in all browsers
- ✅ No build tools needed
- ✅ Simple to use

**Cons:**

- ⚠️ Pollutes global namespace
- ⚠️ Can't tree-shake unused functions

---

### Method 2: ES Modules (Modern)

```html
<!DOCTYPE html>
<html>
  <body>
    <script type="module">
      import { capitalize, isEmail } from "./path/to/string-utils.esm.js";

      const name = capitalize("john doe");
      const valid = isEmail("test@example.com");

      console.log(name, valid);
    </script>
  </body>
</html>
```

**Pros:**

- ✅ No global namespace pollution
- ✅ Modern JavaScript syntax
- ✅ Better for SPAs

**Cons:**

- ⚠️ Requires local server (CORS)
- ⚠️ Not supported in older browsers

---

### Method 3: CDN (Quickest)

#### unpkg

```html
<!-- UMD via unpkg -->
<script src="https://unpkg.com/string-utils/dist/string-utils.min.js"></script>

<script>
  StringUtils.capitalize("hello");
</script>
```

#### jsDelivr

```html
<!-- UMD via jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/string-utils/dist/string-utils.min.js"></script>

<script>
  StringUtils.capitalize("hello");
</script>
```

#### ES Module from CDN

```html
<script type="module">
  import { capitalize } from "https://unpkg.com/string-utils/dist/string-utils.esm.js";

  console.log(capitalize("hello"));
</script>
```

**Pros:**

- ✅ No download needed
- ✅ Cached across sites
- ✅ Always latest version

**Cons:**

- ⚠️ Requires internet connection
- ⚠️ Depends on CDN uptime

---

## 🎯 Live Examples

Check the `examples/` folder for working HTML files:

```bash
cd examples/

# Method 1: Open directly (UMD version)
open browser-script-tag.html

# Method 2 & 3: Requires a local server
python3 -m http.server 8000
# or
npx serve

# Then open: http://localhost:8000/browser-esm.html
```

---

## 📚 Complete API

### Case Utilities

```javascript
// UMD
StringUtils.toUpperCase("hello"); // "HELLO"
StringUtils.toLowerCase("HELLO"); // "hello"
StringUtils.capitalize("hello world"); // "Hello world"
StringUtils.camelCase("hello-world"); // "helloWorld"
StringUtils.kebabCase("helloWorld"); // "hello-world"
StringUtils.snakeCase("helloWorld"); // "hello_world"

// ESM
import { capitalize, camelCase } from "string-utils";
capitalize("hello"); // "Hello"
camelCase("hello-world"); // "helloWorld"
```

### Validation Utilities

```javascript
// UMD
StringUtils.isEmail("test@example.com"); // true
StringUtils.isURL("https://example.com"); // true
StringUtils.isUUID("550e8400-e29b-41d4-a716-446655440000"); // true
StringUtils.isEmpty(""); // true
StringUtils.hasMinLength("hello", 3); // true

// ESM
import { isEmail, isURL } from "string-utils";
isEmail("test@example.com"); // true
isURL("https://example.com"); // true
```

---

## 🔧 package.json Configuration

The browser support is configured via conditional exports:

```json
{
  "browser": "./dist/string-utils.js",
  "unpkg": "./dist/string-utils.min.js",
  "jsdelivr": "./dist/string-utils.min.js",
  "exports": {
    ".": {
      "browser": {
        "import": "./dist/string-utils.esm.js",
        "require": "./dist/string-utils.js",
        "default": "./dist/string-utils.js"
      },
      "import": "./src/index.mjs",
      "require": "./src/index.cjs"
    }
  }
}
```

**How it works:**

- Bundlers (webpack, rollup) check `"browser"` field
- CDNs (unpkg, jsDelivr) use `"unpkg"` and `"jsdelivr"` fields
- Node.js ignores browser fields and uses Node versions

---

## 🏗️ Build Format: UMD

**Universal Module Definition** works everywhere:

```javascript
(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    // AMD (RequireJS)
    define([], factory);
  } else if (typeof module === "object" && module.exports) {
    // CommonJS (Node.js)
    module.exports = factory();
  } else {
    // Browser globals
    root.StringUtils = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  // Your code here
  return {
    capitalize,
    isEmail,
    // ... more functions
  };
});
```

This detects the environment and adapts!

---

## 📊 Browser Compatibility

| Feature | UMD               | ESM    | Support |
| ------- | ----------------- | ------ | ------- |
| Chrome  | ✅ All versions   | ✅ 61+ | Full    |
| Firefox | ✅ All versions   | ✅ 60+ | Full    |
| Safari  | ✅ All versions   | ✅ 11+ | Full    |
| Edge    | ✅ All versions   | ✅ 16+ | Full    |
| IE 11   | ✅ With polyfills | ❌ No  | Partial |

### Polyfills Needed for IE11

```html
<!-- For IE11 support -->
<script src="https://polyfill.io/v3/polyfill.min.js"></script>
<script src="string-utils.min.js"></script>
```

---

## 🎨 Real-World Examples

### Form Validation

```html
<form id="signup-form">
  <input type="text" id="username" placeholder="Username" />
  <input type="email" id="email" placeholder="Email" />
  <button type="submit">Sign Up</button>
</form>

<script src="string-utils.min.js"></script>
<script>
  document.getElementById("signup-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;

    // Validate
    if (StringUtils.isEmpty(username)) {
      alert("Username is required");
      return;
    }

    if (!StringUtils.hasMinLength(username, 3)) {
      alert("Username must be at least 3 characters");
      return;
    }

    if (!StringUtils.isEmail(email)) {
      alert("Invalid email address");
      return;
    }

    // Transform username to snake_case
    const normalizedUsername = StringUtils.snakeCase(username);

    console.log("Valid!", normalizedUsername, email);
  });
</script>
```

### Dynamic URL Generation

```html
<script src="string-utils.min.js"></script>
<script>
  function createSlug(title) {
    // "Hello World 2024" → "hello-world-2024"
    return StringUtils.kebabCase(title);
  }

  const blogPost = {
    title: "My First Blog Post!",
    slug: createSlug("My First Blog Post!"),
  };

  console.log(blogPost.slug); // "my-first-blog-post"
</script>
```

### Real-time Preview

```html
<input type="text" id="input" placeholder="Type something..." />
<div id="output"></div>

<script src="string-utils.min.js"></script>
<script>
  document.getElementById("input").addEventListener("input", (e) => {
    const text = e.target.value;

    const output = `
      <p>Original: ${text}</p>
      <p>camelCase: ${StringUtils.camelCase(text)}</p>
      <p>kebab-case: ${StringUtils.kebabCase(text)}</p>
      <p>snake_case: ${StringUtils.snakeCase(text)}</p>
    `;

    document.getElementById("output").innerHTML = output;
  });
</script>
```

---

## 🚀 Production Checklist

When deploying to production:

- [ ] Use minified version (`string-utils.min.js`)
- [ ] Enable gzip compression on your server
- [ ] Set proper cache headers for CDN
- [ ] Consider using a CDN for better performance
- [ ] Test in target browsers
- [ ] Add polyfills if supporting older browsers

---

## 📏 File Sizes

```
string-utils.js        ~3.2 KB (uncompressed)
string-utils.esm.js    ~2.8 KB (uncompressed)
string-utils.min.js    ~1.5 KB (minified)
string-utils.min.js    ~0.7 KB (minified + gzipped)
```

**Tiny footprint!** Perfect for production use.

---

## 💡 Tips & Best Practices

### 1. Choose the Right Format

- **Small site/prototype?** → UMD via `<script>` tag
- **Modern SPA?** → ES Module import
- **Need quick demo?** → CDN link

### 2. Lazy Loading

```html
<script>
  // Load only when needed
  const btn = document.getElementById("transform");
  btn.addEventListener("click", async () => {
    if (!window.StringUtils) {
      await loadScript("string-utils.min.js");
    }
    StringUtils.capitalize("hello");
  });
</script>
```

### 3. Module Bundlers

If using webpack/rollup, they'll automatically pick the browser version:

```javascript
// webpack/rollup will use dist/string-utils.esm.js for browsers
import { capitalize } from "string-utils";
```

---

## 🎯 Summary

✅ Your package works in browsers via UMD and ESM  
✅ Can be loaded via `<script>`, ES modules, or CDN  
✅ Small file size (~1.5KB minified)  
✅ Works in all modern browsers  
✅ Ready for production use

**Next steps:** Try the examples and integrate into your projects! 🚀
