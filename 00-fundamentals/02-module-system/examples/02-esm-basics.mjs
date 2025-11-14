// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ES Modules (ESM) Basics - Modern JavaScript Modules
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Note: .mjs extension tells Node.js to use ESM

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📦 ES Modules (ESM) Basics');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// ========================================
// Part 1: Export Syntax
// ========================================

console.log('=== 1. Export Syntax ===\n');

console.log('Named Exports (Can have multiple)');
console.log('─────────────────────────────────\n');

console.log('Export during declaration:');
console.log('  export const add = (a, b) => a + b;');
console.log('  export function subtract(a, b) { return a - b; }');
console.log('  export class Calculator { }\n');

console.log('Export after declaration:');
console.log('  const multiply = (a, b) => a * b;');
console.log('  const divide = (a, b) => a / b;');
console.log('  export { multiply, divide };\n');

console.log('Export with rename:');
console.log('  const pow = (a, b) => Math.pow(a, b);');
console.log('  export { pow as power };\n');

console.log('Default Export (Only one per module)');
console.log('────────────────────────────────────────\n');

console.log('Option 1:');
console.log('  export default function calculator() { }');
console.log('  export default class Calculator { }');
console.log('  export default { add, subtract };\n');

console.log('Option 2:');
console.log('  const calculator = { add, subtract };');
console.log('  export default calculator;\n');

console.log('Mix both (Named + Default):');
console.log('  export const add = (a, b) => a + b;');
console.log('  export default class Calculator { }\n');

// ========================================
// Part 2: Import Syntax
// ========================================

console.log('=== 2. Import Syntax ===\n');

console.log('Import named exports:');
console.log('─────────────────────\n');
console.log('  import { add, subtract } from "./math.mjs";');
console.log('  import { add as addition } from "./math.mjs"; // Rename');
console.log('  import * as math from "./math.mjs"; // Import all\n');

console.log('Import default export:');
console.log('──────────────────────\n');
console.log('  import Calculator from "./calculator.mjs";');
console.log('  import calc from "./calculator.mjs"; // Any name works\n');

console.log('Mix both:');
console.log('─────────\n');
console.log('  import Calculator, { add, subtract } from "./math.mjs";\n');

console.log('Import for side effects only:');
console.log('──────────────────────────────\n');
console.log('  import "./setup.mjs"; // Just runs the code\n');

// ========================================
// Part 3: ESM Special Features
// ========================================

console.log('=== 3. ESM Special Features ===\n');

console.log('⭐ Top-Level Await (ESM Only!)');
console.log('────────────────────────────────\n');

console.log('You can use await at the top level:');
console.log('');
console.log('  // This just works in ESM!');
console.log('  const data = await fetch("https://api.example.com");');
console.log('  const json = await data.json();\n');

console.log('Let\'s demonstrate with a real example:\n');

// Simulate an async operation
const fetchData = () => new Promise(resolve => {
  setTimeout(() => resolve({ message: 'Hello from async!' }), 100);
});

const result = await fetchData();
console.log('✅ Top-level await works!');
console.log('   Result:', result.message, '\n');

console.log('⭐ Dynamic Import (import())');
console.log('────────────────────────────\n');

console.log('Load modules dynamically at runtime:');
console.log('');
console.log('  const module = await import("./heavy-module.mjs");');
console.log('  module.doSomething();\n');

console.log('Useful for:');
console.log('  • Lazy loading');
console.log('  • Conditional imports');
console.log('  • Code splitting\n');

// ========================================
// Part 4: ESM vs CommonJS
// ========================================

console.log('=== 4. ESM vs CommonJS ===\n');

console.log('┌────────────────┬─────────────────┬─────────────────┐');
console.log('│ Feature        │ CommonJS (CJS)  │ ESM             │');
console.log('├────────────────┼─────────────────┼─────────────────┤');
console.log('│ Syntax         │ require/exports │ import/export   │');
console.log('│ Loading        │ Synchronous     │ Asynchronous    │');
console.log('│ Dynamic        │ ✅ Yes          │ ⚠️  Via import()│');
console.log('│ Top-level await│ ❌ No           │ ✅ Yes          │');
console.log('│ Tree shaking   │ ❌ No           │ ✅ Yes          │');
console.log('│ Browser support│ ❌ No           │ ✅ Yes          │');
console.log('│ File extension │ .js (default)   │ .mjs or config  │');
console.log('│ this value     │ exports         │ undefined       │');
console.log('│ __dirname      │ ✅ Available    │ ❌ Not available│');
console.log('│ __filename     │ ✅ Available    │ ❌ Not available│');
console.log('└────────────────┴─────────────────┴─────────────────┘\n');

// ========================================
// Part 5: ESM Special Variables
// ========================================

console.log('=== 5. ESM Equivalents for __dirname & __filename ===\n');

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('In ESM, use import.meta:');
console.log('');
console.log('  import.meta.url:', import.meta.url);
console.log('');
console.log('To get __filename and __dirname:');
console.log('');
console.log('  import { fileURLToPath } from "url";');
console.log('  import { dirname } from "path";');
console.log('');
console.log('  const __filename = fileURLToPath(import.meta.url);');
console.log('  const __dirname = dirname(__filename);\n');

console.log('Current values:');
console.log('  __filename:', __filename);
console.log('  __dirname:', __dirname, '\n');

// ========================================
// Part 6: File Extensions
// ========================================

console.log('=== 6. File Extensions ===\n');

console.log('.mjs  → Always treated as ESM');
console.log('.cjs  → Always treated as CommonJS');
console.log('.js   → Depends on package.json "type" field\n');

console.log('package.json configuration:');
console.log('');
console.log('  {');
console.log('    "type": "module"  // .js files are ESM');
console.log('  }\n');
console.log('  {');
console.log('    "type": "commonjs"  // .js files are CJS (default)');
console.log('  }\n');

// ========================================
// Part 7: Strict Mode
// ========================================

console.log('=== 7. Strict Mode ===\n');

console.log('ESM runs in strict mode automatically!');
console.log('  • No need for "use strict";');
console.log('  • this is undefined at top level');
console.log('  • No implicit globals');
console.log('  • Stricter error checking\n');

console.log('Test: this at top level =', this);
console.log('(undefined in ESM, exports object in CommonJS)\n');

// ========================================
// Summary
// ========================================

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📝 Key Takeaways');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('✅ Use .mjs or "type": "module" for ESM');
console.log('✅ import/export statements must be at top level');
console.log('✅ Top-level await works in ESM!');
console.log('✅ Use import() for dynamic imports');
console.log('✅ ESM is async, CJS is sync');
console.log('✅ ESM enables tree-shaking (better bundling)');
console.log('✅ Use import.meta for module metadata');
console.log('✅ Strict mode is automatic in ESM\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
