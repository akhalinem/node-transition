// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Exercise 1: CommonJS to ESM Migration
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Difficulty: ⭐⭐
// Time: 20-30 minutes
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📝 Exercise 1: Convert CommonJS to ESM');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('🎯 Goal: Convert CommonJS modules to ES Modules\n');

console.log('Given these CommonJS modules:\n');

console.log('══════════════════════════════════════════════');
console.log('📄 math.js (CommonJS)');
console.log('══════════════════════════════════════════════');
console.log(`
const PI = 3.14159;

function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

class Calculator {
  constructor(name) {
    this.name = name;
  }

  calculate(a, op, b) {
    switch(op) {
      case '+': return add(a, b);
      case '-': return subtract(a, b);
      case '*': return multiply(a, b);
      default: throw new Error('Unknown operation');
    }
  }
}

module.exports = {
  PI,
  add,
  subtract,
  multiply,
  Calculator
};
`);

console.log('══════════════════════════════════════════════');
console.log('📄 logger.js (CommonJS)');
console.log('══════════════════════════════════════════════');
console.log(`
function log(message) {
  console.log(\`[LOG] \${message}\`);
}

function error(message) {
  console.error(\`[ERROR] \${message}\`);
}

function warn(message) {
  console.warn(\`[WARN] \${message}\`);
}

// Default export
module.exports = log;

// Named exports
module.exports.log = log;
module.exports.error = error;
module.exports.warn = warn;
`);

console.log('══════════════════════════════════════════════');
console.log('📄 app.js (CommonJS)');
console.log('══════════════════════════════════════════════');
console.log(`
const { add, multiply, Calculator, PI } = require('./math');
const logger = require('./logger');

logger.log('Starting app...');

const result1 = add(5, 3);
logger.log(\`5 + 3 = \${result1}\`);

const result2 = multiply(PI, 2);
logger.log(\`PI * 2 = \${result2}\`);

const calc = new Calculator('MyCalc');
const result3 = calc.calculate(10, '+', 5);
logger.log(\`10 + 5 = \${result3}\`);

logger.log('Done!');
`);

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('📋 Your Tasks:\n');

console.log('1. Convert math.js to math.mjs (ESM)');
console.log('   • Use export keyword for named exports');
console.log('   • Keep the same functionality\n');

console.log('2. Convert logger.js to logger.mjs (ESM)');
console.log('   • Use export default for the default export');
console.log('   • Use named exports for log, error, warn\n');

console.log('3. Convert app.js to app.mjs (ESM)');
console.log('   • Use import statements');
console.log('   • Import default and named exports correctly\n');

console.log('4. Run your converted modules');
console.log('   $ node app.mjs\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('💡 Hints:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('Named exports in ESM:');
console.log('  export const PI = 3.14159;');
console.log('  export function add(a, b) { return a + b; }\n');

console.log('Default export in ESM:');
console.log('  export default function log(message) { }\n');

console.log('Import named exports:');
console.log('  import { add, PI } from "./math.mjs";\n');

console.log('Import default export:');
console.log('  import logger from "./logger.mjs";\n');

console.log('Import both:');
console.log('  import logger, { log, error } from "./logger.mjs";\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ Success Criteria:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('• All files use .mjs extension');
console.log('• All module.exports replaced with export');
console.log('• All require() replaced with import');
console.log('• App runs without errors');
console.log('• Output matches original functionality\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📚 Bonus Challenges:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('1. Add a dynamic import in app.mjs');
console.log('   const heavyModule = await import("./heavy.mjs");\n');

console.log('2. Use top-level await to fetch data');
console.log('   const response = await fetch("...");');
console.log('   const data = await response.json();\n');

console.log('3. Try re-exporting from another module');
console.log('   export { add, subtract } from "./math.mjs";\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n💪 Get coding! Create the files and start converting!\n');
