// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Circular Dependencies - The Tricky Part
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const fs = require('fs');
const path = require('path');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔄 Circular Dependencies in Node.js');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// ========================================
// Part 1: What are Circular Dependencies?
// ========================================

console.log('=== 1. What are Circular Dependencies? ===\n');

console.log('Module A requires Module B');
console.log('Module B requires Module A');
console.log('         ↓');
console.log('    CIRCULAR!\n');

console.log('Example:');
console.log('');
console.log('// a.js');
console.log('const b = require("./b");');
console.log('module.exports = { name: "A", friend: b };');
console.log('');
console.log('// b.js');
console.log('const a = require("./a");');
console.log('module.exports = { name: "B", friend: a };\n');

// ========================================
// Part 2: Demo - Circular Dependency
// ========================================

console.log('=== 2. Creating Circular Modules ===\n');

const moduleAPath = path.join(__dirname, 'temp-a.js');
const moduleBPath = path.join(__dirname, 'temp-b.js');

// Module A
const moduleACode = `
console.log('📦 Module A: Starting...');
const b = require('./temp-b');
console.log('📦 Module A: Got module B:', b);

module.exports = {
  name: 'Module A',
  friendName: b ? b.name : 'unknown'
};

console.log('📦 Module A: Finished');
`;

// Module B
const moduleBCode = `
console.log('📦 Module B: Starting...');
const a = require('./temp-a');
console.log('📦 Module B: Got module A:', a);

module.exports = {
  name: 'Module B',
  friendName: a ? a.name : 'unknown'
};

console.log('📦 Module B: Finished');
`;

fs.writeFileSync(moduleAPath, moduleACode);
fs.writeFileSync(moduleBPath, moduleBCode);

console.log('✅ Created temp-a.js and temp-b.js\n');

// ========================================
// Part 3: What Happens?
// ========================================

console.log('=== 3. Loading Circular Module ===\n');
console.log('Requiring Module A...\n');

const a = require('./temp-a');

console.log('\n📊 Result:');
console.log('Module A:', a);
console.log('\n');

// ========================================
// Part 4: How Node.js Handles It
// ========================================

console.log('=== 4. How Node.js Handles Circular Dependencies ===\n');

console.log('Execution order:');
console.log('');
console.log('1. Module A starts executing');
console.log('2. Module A requires B');
console.log('3. Module B starts executing');
console.log('4. Module B requires A');
console.log('5. ⚠️  A is not finished yet!');
console.log('6. Node returns PARTIAL exports of A (empty at this point)');
console.log('7. Module B finishes with partial A');
console.log('8. Module A gets completed B');
console.log('9. Module A finishes\n');

console.log('Key point: Module B gets an INCOMPLETE version of A!');
console.log('This is called an "unfinished export" or "partial export"\n');

// ========================================
// Part 5: The Problem
// ========================================

console.log('=== 5. The Problem with Circular Dependencies ===\n');

const problematicAPath = path.join(__dirname, 'temp-prob-a.js');
const problematicBPath = path.join(__dirname, 'temp-prob-b.js');

// Problematic Module A
const probACode = `
const b = require('./temp-prob-b');

function greet() {
  return 'Hello from A, ' + b.greet();
}

module.exports = { greet };
`;

// Problematic Module B
const probBCode = `
const a = require('./temp-prob-a');

function greet() {
  // This will fail! a.greet doesn't exist yet
  return 'Hello from B, ' + a.greet();
}

module.exports = { greet };
`;

fs.writeFileSync(problematicAPath, probACode);
fs.writeFileSync(problematicBPath, probBCode);

console.log('Created problematic circular modules...\n');

try {
  const probA = require('./temp-prob-a');
  probA.greet();
} catch (error) {
  console.log('💥 Error:', error.message);
  console.log('\nWhy? Module B tried to call a.greet() before A finished exporting!\n');
}

// ========================================
// Part 6: Solutions
// ========================================

console.log('=== 6. Solutions ===\n');

console.log('✅ Solution 1: Restructure (Best!)');
console.log('───────────────────────────────────\n');
console.log('Extract shared code to a third module:');
console.log('');
console.log('// shared.js');
console.log('module.exports = { commonFunction };');
console.log('');
console.log('// a.js');
console.log('const shared = require("./shared");');
console.log('');
console.log('// b.js');
console.log('const shared = require("./shared");\n');

console.log('✅ Solution 2: Lazy Loading');
console.log('────────────────────────────\n');
console.log('Require inside functions, not at top:');
console.log('');
console.log('// a.js');
console.log('function useB() {');
console.log('  const b = require("./b"); // Load when needed');
console.log('  return b.something();');
console.log('}\n');

console.log('✅ Solution 3: Export after require');
console.log('────────────────────────────────────\n');
console.log('// a.js');
console.log('const b = require("./b");');
console.log('');
console.log('function greet() {');
console.log('  return "Hello from A";');
console.log('}');
console.log('');
console.log('// Export AFTER requiring');
console.log('module.exports = { greet };\n');

// ========================================
// Part 7: ESM Circular Dependencies
// ========================================

console.log('=== 7. Circular Dependencies in ESM ===\n');

console.log('ESM handles circulars better because:');
console.log('  • Imports are hoisted (processed first)');
console.log('  • Exports are "live bindings"');
console.log('  • Module structure is known before execution\n');

console.log('Example that works in ESM but not CommonJS:');
console.log('');
console.log('// a.mjs');
console.log('import { bValue } from "./b.mjs";');
console.log('export const aValue = "A";');
console.log('console.log(bValue); // Works!\n');

console.log('// b.mjs');
console.log('import { aValue } from "./a.mjs";');
console.log('export const bValue = "B";');
console.log('console.log(aValue); // Works!\n');

console.log('⚠️  But functions still need to be defined before use!\n');

// ========================================
// Part 8: Detection
// ========================================

console.log('=== 8. Detecting Circular Dependencies ===\n');

console.log('Tools to find circulars:');
console.log('  • madge: npm install -g madge');
console.log('    $ madge --circular src/');
console.log('');
console.log('  • dpdm: npm install -g dpdm');
console.log('    $ dpdm --circular src/index.js');
console.log('');
console.log('  • ESLint: import/no-cycle rule\n');

// ========================================
// Cleanup
// ========================================

console.log('=== Cleanup ===\n');
fs.unlinkSync(moduleAPath);
fs.unlinkSync(moduleBPath);
fs.unlinkSync(problematicAPath);
fs.unlinkSync(problematicBPath);
// Clear from cache
delete require.cache[require.resolve('./temp-a')];
delete require.cache[require.resolve('./temp-b')];
delete require.cache[require.resolve('./temp-prob-a')];
delete require.cache[require.resolve('./temp-prob-b')];
console.log('✅ Cleaned up temporary files\n');

// ========================================
// Summary
// ========================================

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📝 Key Takeaways');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('✅ Circular dependencies CAN work in Node.js');
console.log('✅ But one module gets an incomplete version');
console.log('✅ Can cause bugs if you use incomplete exports');
console.log('✅ Best solution: Restructure to avoid them');
console.log('✅ Alternative: Lazy loading with functions');
console.log('✅ ESM handles them slightly better');
console.log('✅ Use tools like madge to detect them');
console.log('✅ Generally considered a code smell\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
