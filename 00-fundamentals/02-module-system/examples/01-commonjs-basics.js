// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CommonJS Basics - The Traditional Node.js Module System
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📦 CommonJS Module System Basics');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// ========================================
// Part 1: The 'module' Object
// ========================================

console.log('=== 1. The module Object ===\n');

console.log('Every file in Node.js is a module!');
console.log('Each module has access to a "module" object:\n');

console.log('module.id:', module.id);
console.log('module.filename:', module.filename);
console.log('module.loaded:', module.loaded);
console.log('module.parent:', module.parent ? 'Has parent' : 'Entry point');
console.log('module.children:', module.children.length, 'children');
console.log('module.exports:', typeof module.exports);
console.log('module.paths (resolution paths):', module.paths.length, 'paths\n');

// ========================================
// Part 2: Exporting with module.exports
// ========================================

console.log('=== 2. Exporting with module.exports ===\n');

console.log('Method 1: Export an object');
console.log('─────────────────────────────\n');

// This is what we can export
const calculator = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => a / b
};

console.log('Code: module.exports = calculator;');
console.log('Usage: const calc = require("./module");');
console.log('       calc.add(5, 3); // 8\n');

console.log('Method 2: Export individual properties');
console.log('────────────────────────────────────────\n');

console.log('Code: module.exports.add = (a, b) => a + b;');
console.log('      module.exports.subtract = (a, b) => a - b;');
console.log('Usage: const { add, subtract } = require("./module");\n');

console.log('Method 3: Using exports shorthand');
console.log('──────────────────────────────────\n');

console.log('⚠️  exports is a REFERENCE to module.exports');
console.log('    exports === module.exports  // true initially\n');

console.log('✅ WORKS:');
console.log('   exports.add = (a, b) => a + b;');
console.log('   exports.subtract = (a, b) => a - b;\n');

console.log('❌ BROKEN:');
console.log('   exports = { add: fn, subtract: fn };');
console.log('   ↑ This breaks the reference!');
console.log('   Only module.exports is returned, not exports\n');

// ========================================
// Part 3: The Module Wrapper
// ========================================

console.log('=== 3. Module Wrapper Function ===\n');

console.log('Node.js wraps every module in a function:');
console.log('');
console.log('(function(exports, require, module, __filename, __dirname) {');
console.log('  // Your module code here');
console.log('});\n');

console.log('This gives you access to:');
console.log('  • exports     - Reference to module.exports');
console.log('  • require     - Function to load other modules');
console.log('  • module      - Current module object');
console.log('  • __filename  - Absolute path to current file');
console.log('  • __dirname   - Absolute path to current directory\n');

console.log('Current values:');
console.log('  __filename:', __filename);
console.log('  __dirname:', __dirname);
console.log('  require:', typeof require);
console.log('  exports === module.exports:', exports === module.exports, '\n');

// ========================================
// Part 4: Dynamic Requires
// ========================================

console.log('=== 4. Dynamic Requires (CommonJS Power) ===\n');

console.log('CommonJS allows dynamic requires at runtime:');
console.log('');
console.log('Example 1: Conditional loading');
console.log('──────────────────────────────');
console.log('const isDev = process.env.NODE_ENV === "development";');
console.log('const logger = isDev ? require("./dev-logger") : require("./prod-logger");\n');

console.log('Example 2: Lazy loading');
console.log('───────────────────────');
console.log('function processData(data) {');
console.log('  const parser = require("./heavy-parser"); // Only loads when called');
console.log('  return parser.parse(data);');
console.log('}\n');

console.log('Example 3: Dynamic path');
console.log('───────────────────────');
console.log('const locale = "en";');
console.log('const messages = require(`./locales/${locale}.json`);\n');

console.log('⚠️  Note: ES Modules do NOT support this!');
console.log('    ESM imports are static and must be at top of file.\n');

// ========================================
// Part 5: require() Under the Hood
// ========================================

console.log('=== 5. How require() Works ===\n');

console.log('Step 1: Resolve - Find the file');
console.log('  • Check if core module (fs, path, http)');
console.log('  • Check node_modules folders');
console.log('  • Check relative paths');
console.log('  • Try .js, .json, .node extensions\n');

console.log('Step 2: Load - Read file content');
console.log('  • Read the file from disk');
console.log('  • Wrap in module function\n');

console.log('Step 3: Wrap - Add wrapper function');
console.log('  • Inject exports, require, module, etc.\n');

console.log('Step 4: Evaluate - Execute the code');
console.log('  • Run the wrapped function');
console.log('  • Populate module.exports\n');

console.log('Step 5: Cache - Store in require.cache');
console.log('  • Subsequent requires return cached version\n');

// ========================================
// Part 6: require.cache
// ========================================

console.log('=== 6. Module Cache ===\n');

console.log('require.cache stores all loaded modules:');
console.log('Type:', typeof require.cache);
console.log('Keys:', Object.keys(require.cache).length, 'cached modules\n');

console.log('Each cached entry includes:');
console.log('  • id: Full file path');
console.log('  • exports: The exported value');
console.log('  • loaded: Boolean (is loading complete)');
console.log('  • parent: Module that required this one');
console.log('  • children: Modules required by this one\n');

console.log('You can clear cache (useful for hot-reloading):');
console.log('  delete require.cache[require.resolve("./module")];');
console.log('  const fresh = require("./module"); // Reloads from disk\n');

// ========================================
// Summary
// ========================================

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📝 Key Takeaways');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('✅ Every file is a module with its own scope');
console.log('✅ Use module.exports to export values');
console.log('✅ exports is a reference to module.exports');
console.log('✅ require() is synchronous and dynamic');
console.log('✅ Modules are cached in require.cache');
console.log('✅ Modules run in a wrapper function');
console.log('✅ CommonJS allows runtime/conditional requires\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
