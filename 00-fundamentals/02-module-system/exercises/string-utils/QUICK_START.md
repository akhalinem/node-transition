# Quick Start - Testing TypeScript Support

## ✅ Test Type Checking

```bash
# Install TypeScript (if not already installed)
npm install -g typescript

# Type check the test file
tsc --noEmit test/test-types.ts

# Or use the tsconfig
tsc
```

**Expected output:** No errors! ✅

---

## 🧪 Test in VS Code

1. Open `test/test-types.ts`
2. Hover over any function (e.g., `capitalize`)
3. You'll see:

   ```
   function capitalize(str: string): string

   Capitalizes the first letter of a string.
   @param str - The string to capitalize
   @returns The capitalized string
   ```

4. Uncomment the error examples (lines with `// const result...`)
5. You'll see red squiggles indicating type errors!

---

## 💻 Test Imports

Create a new TypeScript file to test imports:

```typescript
// test-manual.ts
import { capitalize, isEmail } from "./src/index.mjs";

const name = capitalize("john");
//    ^? const name: string (hover to see type)

const valid = isEmail("test@example.com");
//    ^? const valid: boolean

console.log(name, valid);
```

Run:

```bash
tsc --noEmit test-manual.ts
```

---

## 📦 Test All Entry Points

```typescript
// Main entry
import { capitalize } from "string-utils";

// Subpath: case
import { camelCase } from "string-utils/case";

// Subpath: validation
import { isEmail } from "string-utils/validation";
```

All should have full type information!

---

## 🎯 Verify Package Structure

```bash
# Check all type definition files exist
ls -la src/*.d.ts

# Should show:
# case.d.ts
# index.d.ts
# validation.d.ts
```

---

## ✨ IntelliSense Demo

Type this in a TypeScript file:

```typescript
import {} from "string-utils";
//       ^
// When cursor is here, press Ctrl+Space
// You'll see all available exports with documentation!
```

---

## 🐛 Common Issues

### Issue: Types not found

**Solution:** Make sure `package.json` has:

```json
{
  "types": "./src/index.d.ts",
  "exports": {
    ".": {
      "types": "./src/index.d.ts"
    }
  }
}
```

### Issue: IntelliSense not working

**Solution:** Reload VS Code window

- Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
- Type "Reload Window"
- Press Enter

---

## 📚 Next Steps

1. ✅ Type check passes
2. ✅ IntelliSense works
3. ✅ Documentation shows up
4. ✅ Error detection works

**Your package is TypeScript-ready!** 🎉
