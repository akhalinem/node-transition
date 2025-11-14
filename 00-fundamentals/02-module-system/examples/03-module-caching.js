// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Module Caching Demonstration
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🗄️  Module Caching in Node.js');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// ========================================
// Setup: Create a counter module
// ========================================

const fs = require('fs');
const path = require('path');

console.log('=== Setting up test module ===\n');

// Create a temporary counter module
const counterModulePath = path.join(__dirname, 'temp-counter.js');
const counterModuleCode = `
let count = 0;

console.log('⚡ Counter module is being executed!');

module.exports = {
  increment() {
    count++;
    return count;
  },
  getCount() {
    return count;
  },
  reset() {
    count = 0;
  }
};
`;

fs.writeFileSync(counterModulePath, counterModuleCode);
console.log('✅ Created temp-counter.js\n');

// ========================================
// Part 1: Modules are Cached (Singleton)
// ========================================

console.log('=== 1. Modules are Cached ===\n');

console.log('First require:');
const counter1 = require('./temp-counter');
console.log('counter1.increment():', counter1.increment()); // 1

console.log('\nSecond require (same file):');
const counter2 = require('./temp-counter'); // Won't execute again!
console.log('counter2.getCount():', counter2.getCount()); // Still 1!

console.log('\nAre they the same object?');
console.log('counter1 === counter2:', counter1 === counter2); // true

console.log('\nModify via counter2:');
console.log('counter2.increment():', counter2.increment()); // 2

console.log('\nCheck counter1:');
console.log('counter1.getCount():', counter1.getCount()); // Also 2!

console.log('\n💡 Key insight: Module is executed ONCE, then cached!');
console.log('   All requires return the SAME object.\n');

// ========================================
// Part 2: Exploring require.cache
// ========================================

console.log('=== 2. The require.cache Object ===\n');

console.log('require.cache is an object with all loaded modules:');
console.log('Type:', typeof require.cache);
console.log('Total cached modules:', Object.keys(require.cache).length, '\n');

const counterCacheKey = require.resolve('./temp-counter');
console.log('Our counter module key:', counterCacheKey);
console.log('Is it cached?', counterCacheKey in require.cache);
console.log('\nCached module object keys:');
console.log('  •', Object.keys(require.cache[counterCacheKey]).join(', '), '\n');

// ========================================
// Part 3: Clearing the Cache
// ========================================

console.log('=== 3. Clearing the Cache ===\n');

console.log('Current count:', counter1.getCount()); // 2

console.log('\nClearing cache for temp-counter...');
delete require.cache[counterCacheKey];
console.log('Is still cached?', counterCacheKey in require.cache);

console.log('\nRequire again (will re-execute):');
const counter3 = require('./temp-counter'); // Executes again!
console.log('counter3.getCount():', counter3.getCount()); // 0 (fresh start!)

console.log('\nAre counter1 and counter3 the same?');
console.log('counter1 === counter3:', counter1 === counter3); // false!

console.log('\n💡 Clearing cache causes module to re-execute!');
console.log('   Useful for hot-reloading in development.\n');

// ========================================
// Part 4: Cache Key Resolution
// ========================================

console.log('=== 4. Cache Keys (Absolute Paths) ===\n');

console.log('Cache keys are ABSOLUTE file paths:');
console.log('');
console.log('Examples from current cache:');
const cacheKeys = Object.keys(require.cache).slice(0, 3);
cacheKeys.forEach((key, i) => {
  console.log(`  ${i + 1}. ${key}`);
});
console.log('');

console.log('This means:');
console.log('  • require("./module") from different dirs = different cache entries');
console.log('  • require("package") always resolves to same path = same cache\n');

// ========================================
// Part 5: Practical Use Cases
// ========================================

console.log('=== 5. Practical Use Cases ===\n');

console.log('✅ Good: Singletons');
console.log('───────────────────\n');
console.log('// database.js');
console.log('const connection = createDbConnection();');
console.log('module.exports = connection;');
console.log('');
console.log('// Multiple files require the same connection');
console.log('const db = require("./database"); // Always same instance\n');

console.log('✅ Good: Configuration');
console.log('──────────────────────\n');
console.log('// config.js');
console.log('module.exports = {');
console.log('  apiKey: process.env.API_KEY,');
console.log('  dbUrl: process.env.DATABASE_URL');
console.log('};');
console.log('');
console.log('// Loaded once, values cached\n');

console.log('⚠️  Watch out: State management');
console.log('───────────────────────────────\n');
console.log('If your module holds state (like our counter),');
console.log('that state is SHARED across all imports!');
console.log('');
console.log('This can be a feature (singleton) or a bug (unexpected sharing).\n');

console.log('🔧 Development: Hot reloading');
console.log('─────────────────────────────\n');
console.log('function reloadModule(modulePath) {');
console.log('  const resolved = require.resolve(modulePath);');
console.log('  delete require.cache[resolved];');
console.log('  return require(modulePath);');
console.log('}\n');

// ========================================
// Part 6: ESM Caching
// ========================================

console.log('=== 6. ESM Caching ===\n');

console.log('ES Modules are also cached, but:');
console.log('  • No require.cache to inspect');
console.log('  • No way to clear the cache');
console.log('  • Cache is based on full URL (file://)');
console.log('  • Module is parsed & linked, then executed once');
console.log('  • Re-importing gives the same instance\n');

console.log('To "reload" ESM in development:');
console.log('  • Add query params: import(`./module.js?t=${Date.now()}`);');
console.log('  • Or restart Node.js process\n');

// ========================================
// Cleanup
// ========================================

console.log('=== Cleanup ===\n');
fs.unlinkSync(counterModulePath);
console.log('✅ Removed temp-counter.js\n');

// ========================================
// Summary
// ========================================

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📝 Key Takeaways');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('✅ Modules execute ONCE, then cached');
console.log('✅ require.cache stores all loaded modules');
console.log('✅ Cache keys are absolute file paths');
console.log('✅ Same module = same object (singleton pattern)');
console.log('✅ Can clear cache for hot-reloading');
console.log('✅ ESM is also cached but no manual control');
console.log('✅ Shared state in modules can be feature or bug\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
