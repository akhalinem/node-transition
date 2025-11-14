// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Module Resolution Algorithm
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔍 Module Resolution in Node.js');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// ========================================
// Part 1: require.resolve()
// ========================================

console.log('=== 1. require.resolve() ===\n');

console.log('Shows WHERE Node.js finds a module:\n');

// Core modules
console.log('Core modules (built-in):');
console.log('  fs:', require.resolve('fs'));
console.log('  path:', require.resolve('path'));
console.log('  http:', require.resolve('http'));
console.log('\n→ Core modules don\'t have file paths\n');

// Current file
console.log('Current file:');
console.log('  __filename:', __filename);
console.log('  require.resolve(__filename):', require.resolve(__filename));
console.log('\n');

// ========================================
// Part 2: Resolution Algorithm
// ========================================

console.log('=== 2. How require() Resolves Modules ===\n');

console.log('When you call require("something"), Node.js:');
console.log('');
console.log('Step 1: Check if it\'s a CORE module');
console.log('────────────────────────────────────');
console.log('  require("fs")  → loads built-in fs');
console.log('  require("path") → loads built-in path');
console.log('  ✅ Done! (core modules have priority)\n');

console.log('Step 2: Check if it starts with ./ or ../ or /');
console.log('──────────────────────────────────────────────');
console.log('  require("./module")  → relative to current file');
console.log('  require("../utils")  → parent directory');
console.log('  require("/abs/path") → absolute path');
console.log('');
console.log('  Try in order:');
console.log('    1. ./module.js');
console.log('    2. ./module.json');
console.log('    3. ./module.node');
console.log('    4. ./module/index.js');
console.log('    5. ./module/package.json (check "main" field)');
console.log('  ✅ First match wins!\n');

console.log('Step 3: Not relative → Check node_modules/');
console.log('─────────────────────────────────────────────');
console.log('  require("express")');
console.log('');
console.log('  Search upward through directories:');
console.log('    1. /current/dir/node_modules/express');
console.log('    2. /current/node_modules/express');
console.log('    3. /node_modules/express');
console.log('    4. (Keep going up to root)');
console.log('  ✅ First match wins!\n');

console.log('Step 4: Check NODE_PATH (rarely used)');
console.log('──────────────────────────────────────\n');

// ========================================
// Part 3: Module Resolution Paths
// ========================================

console.log('=== 3. module.paths ===\n');

console.log('Node.js searches these paths (in order):');
console.log('');
module.paths.forEach((p, i) => {
  console.log(`  ${i + 1}. ${p}`);
});
console.log('\n');

// ========================================
// Part 4: File Extensions
// ========================================

console.log('=== 4. File Extensions ===\n');

console.log('Default extension priority:');
console.log('  1. .js   (JavaScript)');
console.log('  2. .json (JSON file)');
console.log('  3. .node (Compiled addon)\n');

console.log('CommonJS:');
console.log('  .js  → Wrapped in module wrapper');
console.log('  .cjs → Always treated as CommonJS\n');

console.log('ES Modules:');
console.log('  .mjs → Always treated as ESM');
console.log('  .js  → ESM if package.json has "type": "module"\n');

console.log('⚠️  Best practice: Always use explicit extensions in ESM!');
console.log('    import thing from "./module.js" ✅');
console.log('    import thing from "./module"    ❌ (error in ESM)\n');

// ========================================
// Part 5: package.json Fields
// ========================================

console.log('=== 5. package.json Module Fields ===\n');

console.log('"main" - Entry point (CommonJS)');
console.log('─────────────────────────────────');
console.log('{');
console.log('  "main": "./dist/index.js"');
console.log('}\n');

console.log('"module" - Entry point (ESM, bundler convention)');
console.log('─────────────────────────────────────────────────');
console.log('{');
console.log('  "main": "./dist/index.js",');
console.log('  "module": "./dist/index.mjs"');
console.log('}\n');

console.log('"exports" - Modern field (conditional exports)');
console.log('───────────────────────────────────────────────');
console.log('{');
console.log('  "exports": {');
console.log('    ".": {');
console.log('      "import": "./dist/index.mjs",');
console.log('      "require": "./dist/index.cjs"');
console.log('    },');
console.log('    "./utils": "./dist/utils.js"');
console.log('  }');
console.log('}\n');

console.log('"type" - Default module system');
console.log('──────────────────────────────');
console.log('{');
console.log('  "type": "module"     // .js files are ESM');
console.log('  "type": "commonjs"   // .js files are CJS (default)');
console.log('}\n');

// ========================================
// Part 6: Conditional Exports
// ========================================

console.log('=== 6. Conditional Exports (Advanced) ===\n');

console.log('You can export different files based on:');
console.log('  • import vs require');
console.log('  • Node.js vs browser');
console.log('  • Development vs production');
console.log('  • Different Node versions\n');

console.log('Example:');
console.log('');
console.log('{');
console.log('  "exports": {');
console.log('    ".": {');
console.log('      "node": {');
console.log('        "import": "./node-esm.mjs",');
console.log('        "require": "./node-cjs.js"');
console.log('      },');
console.log('      "default": "./browser.js"');
console.log('    }');
console.log('  }');
console.log('}\n');

console.log('Conditions checked in order:');
console.log('  1. "node" (when running in Node.js)');
console.log('  2. "import" (when using ESM)');
console.log('  3. "require" (when using CommonJS)');
console.log('  4. "default" (fallback)\n');

// ========================================
// Part 7: Subpath Exports
// ========================================

console.log('=== 7. Subpath Exports ===\n');

console.log('Control what users can import from your package:');
console.log('');
console.log('{');
console.log('  "name": "my-package",');
console.log('  "exports": {');
console.log('    ".": "./index.js",           // import "my-package"');
console.log('    "./utils": "./utils.js",     // import "my-package/utils"');
console.log('    "./utils/*": "./utils/*.js"  // import "my-package/utils/foo"');
console.log('  }');
console.log('}\n');

console.log('Benefits:');
console.log('  ✅ Encapsulation - hide internal files');
console.log('  ✅ Dual package - different files for CJS/ESM');
console.log('  ✅ Tree-shaking - bundlers understand structure\n');

console.log('What users CANNOT do:');
console.log('  ❌ import "my-package/internal/secret.js"');
console.log('  ❌ import "my-package/dist/utils.js"');
console.log('     (Not in exports = not accessible!)\n');

// ========================================
// Part 8: Resolution Examples
// ========================================

console.log('=== 8. Practical Examples ===\n');

console.log('Example 1: Same file, different paths');
console.log('──────────────────────────────────────');
console.log('const path = require("path");');
console.log('');
console.log('// All resolve to the same file:');
console.log('require("./module");');
console.log('require("./module.js");');
console.log('require(path.join(__dirname, "module"));');
console.log('require(path.resolve(__dirname, "module.js"));\n');

console.log('Example 2: Package vs local file');
console.log('─────────────────────────────────');
console.log('require("express")      // Package from node_modules/');
console.log('require("./express")    // Local file ./express.js\n');

console.log('Example 3: Core modules shadow local');
console.log('─────────────────────────────────────');
console.log('require("fs")           // ✅ Core module (built-in)');
console.log('require("./fs")         // ✅ Local file ./fs.js\n');

console.log('Example 4: Directory imports');
console.log('────────────────────────────');
console.log('require("./utils")');
console.log('');
console.log('Looks for (in order):');
console.log('  1. ./utils.js');
console.log('  2. ./utils.json');
console.log('  3. ./utils.node');
console.log('  4. ./utils/package.json → "main" field');
console.log('  5. ./utils/index.js ← Common convention\n');

// ========================================
// Summary
// ========================================

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📝 Key Takeaways');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('✅ require.resolve() shows where modules are');
console.log('✅ Core modules have priority');
console.log('✅ Relative paths (./ ../) search from current file');
console.log('✅ Package names search node_modules upward');
console.log('✅ File extensions: .js, .json, .node');
console.log('✅ package.json "exports" controls access');
console.log('✅ "type": "module" makes .js files ESM');
console.log('✅ ESM requires explicit file extensions\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
