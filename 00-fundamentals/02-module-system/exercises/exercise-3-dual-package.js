// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Exercise 3: Package with Conditional Exports
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Difficulty: ⭐⭐⭐
// Time: 40-50 minutes
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📝 Exercise 3: Dual Package (CJS + ESM)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('🎯 Goal: Create a package that works with both CommonJS and ESM\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 Scenario: String Utility Library');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('You\'re creating a string utility library that should:');
console.log('  ✅ Work in CommonJS projects (require)');
console.log('  ✅ Work in ESM projects (import)');
console.log('  ✅ Expose multiple entry points');
console.log('  ✅ Hide internal implementation\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📦 Package Structure to Create:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log(`
string-utils/
├── package.json
├── src/
│   ├── index.cjs         (CommonJS entry)
│   ├── index.mjs         (ESM entry)
│   ├── case.cjs          (Case utilities - CJS)
│   ├── case.mjs          (Case utilities - ESM)
│   ├── validation.cjs    (Validation - CJS)
│   ├── validation.mjs    (Validation - ESM)
│   └── internal.js       (Should NOT be importable!)
├── test/
│   ├── test-cjs.js       (Test CommonJS usage)
│   └── test-esm.mjs      (Test ESM usage)
└── README.md
`);

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 Task 1: Implement the Utilities');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('Implement these functions in both CJS and ESM versions:\n');

console.log('Case Utilities (case.cjs / case.mjs):');
console.log('─────────────────────────────────────');
console.log('  • toUpperCase(str)');
console.log('  • toLowerCase(str)');
console.log('  • capitalize(str)');
console.log('  • camelCase(str)');
console.log('  • kebabCase(str)');
console.log('  • snakeCase(str)\n');

console.log('Validation Utilities (validation.cjs / validation.mjs):');
console.log('───────────────────────────────────────────────────────');
console.log('  • isEmail(str)');
console.log('  • isURL(str)');
console.log('  • isUUID(str)');
console.log('  • isEmpty(str)');
console.log('  • hasMinLength(str, min)\n');

console.log('Main Entry (index.cjs / index.mjs):');
console.log('────────────────────────────────────');
console.log('  Re-export everything from case and validation\n');

console.log('Internal (internal.js):');
console.log('───────────────────────');
console.log('  Helper functions that should NOT be exposed\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 Task 2: Configure package.json');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('Create package.json with conditional exports:\n');

console.log(`
{
  "name": "string-utils",
  "version": "1.0.0",
  "exports": {
    ".": {
      "import": "./src/index.mjs",
      "require": "./src/index.cjs"
    },
    "./case": {
      "import": "./src/case.mjs",
      "require": "./src/case.cjs"
    },
    "./validation": {
      "import": "./src/validation.mjs",
      "require": "./src/validation.cjs"
    }
  }
}
`);

console.log('This configuration allows:');
console.log('  • import utils from "string-utils"');
console.log('  • import { capitalize } from "string-utils/case"');
console.log('  • const utils = require("string-utils")');
console.log('  • const { capitalize } = require("string-utils/case")\n');

console.log('And prevents:');
console.log('  ❌ require("string-utils/src/internal")');
console.log('  ❌ import anything from "./src/internal.js"\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 Task 3: Write Tests');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('test-cjs.js (CommonJS test):');
console.log('─────────────────────────────\n');

console.log(`
const { capitalize, camelCase } = require('string-utils/case');
const { isEmail } = require('string-utils/validation');

console.log('Testing CommonJS imports...');

console.assert(capitalize('hello') === 'Hello');
console.assert(camelCase('hello-world') === 'helloWorld');
console.assert(isEmail('test@example.com') === true);

console.log('✅ All CommonJS tests passed!');
`);

console.log('test-esm.mjs (ESM test):');
console.log('────────────────────────\n');

console.log(`
import { capitalize, camelCase } from 'string-utils/case';
import { isEmail } from 'string-utils/validation';

console.log('Testing ESM imports...');

console.assert(capitalize('hello') === 'Hello');
console.assert(camelCase('hello-world') === 'helloWorld');
console.assert(isEmail('test@example.com') === true);

console.log('✅ All ESM tests passed!');
`);

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('💡 Implementation Hints:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('Example: case.cjs (CommonJS version)');
console.log('─────────────────────────────────────\n');

console.log(`
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function camelCase(str) {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
}

// More functions...

module.exports = {
  capitalize,
  camelCase,
  // ... more exports
};
`);

console.log('Example: case.mjs (ESM version)');
console.log('────────────────────────────────\n');

console.log(`
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function camelCase(str) {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
}

// More functions...
`);

console.log('Example: index.cjs (Re-export in CommonJS)');
console.log('───────────────────────────────────────────\n');

console.log(`
module.exports = {
  ...require('./case.cjs'),
  ...require('./validation.cjs')
};
`);

console.log('Example: index.mjs (Re-export in ESM)');
console.log('──────────────────────────────────────\n');

console.log(`
export * from './case.mjs';
export * from './validation.mjs';
`);

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ Success Criteria:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('• Works with both require() and import');
console.log('• Subpath exports work (./case, ./validation)');
console.log('• Internal files are not accessible');
console.log('• All tests pass');
console.log('• Can run: node test/test-cjs.js');
console.log('• Can run: node test/test-esm.mjs\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🧪 Testing Your Package:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('1. Test CommonJS usage:');
console.log('   $ node test/test-cjs.js\n');

console.log('2. Test ESM usage:');
console.log('   $ node test/test-esm.mjs\n');

console.log('3. Test that internal is hidden:');
console.log('   $ node -e "require(\'string-utils/src/internal\')"');
console.log('   Should error: Package subpath \'./src/internal\' is not defined\n');

console.log('4. Test subpath exports:');
console.log('   $ node -e "const {capitalize} = require(\'string-utils/case\'); console.log(capitalize(\'hello\'))"');
console.log('   Should output: Hello\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📚 Bonus Challenges:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('1. Add TypeScript definitions (.d.ts files)');
console.log('2. Add a browser build with conditional "browser" export');
console.log('3. Add development vs production builds');
console.log('4. Create a build script to generate CJS from ESM');
console.log('5. Add JSDoc comments for documentation\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🎯 This is how real npm packages are structured!\n');
