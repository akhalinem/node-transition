// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Exercise 2: Fix Circular Dependencies
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Difficulty: ⭐⭐⭐
// Time: 30-40 minutes
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const fs = require('fs');
const path = require('path');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📝 Exercise 2: Fix Circular Dependencies');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('🎯 Goal: Identify and fix circular dependency issues\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 Scenario: E-Commerce System');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Create problematic modules
const userPath = path.join(__dirname, 'ex2-user.js');
const orderPath = path.join(__dirname, 'ex2-order.js');
const productPath = path.join(__dirname, 'ex2-product.js');

console.log('Creating problematic circular dependency modules...\n');

// User module
const userCode = `
const { Order } = require('./ex2-order');

class User {
  constructor(name) {
    this.name = name;
    this.orders = [];
  }

  placeOrder(product, quantity) {
    const order = new Order(this, product, quantity);
    this.orders.push(order);
    return order;
  }

  getTotalSpent() {
    return this.orders.reduce((sum, order) => sum + order.getTotal(), 0);
  }
}

module.exports = { User };
`;

// Order module
const orderCode = `
const { User } = require('./ex2-user');
const { Product } = require('./ex2-product');

class Order {
  constructor(user, product, quantity) {
    this.user = user;
    this.product = product;
    this.quantity = quantity;
    this.date = new Date();
  }

  getTotal() {
    return this.product.price * this.quantity;
  }

  getUserName() {
    return this.user.name;
  }

  getProductName() {
    return this.product.name;
  }
}

module.exports = { Order };
`;

// Product module
const productCode = `
const { Order } = require('./ex2-order');

class Product {
  constructor(name, price) {
    this.name = name;
    this.price = price;
    this.orderHistory = [];
  }

  recordOrder(order) {
    this.orderHistory.push(order);
  }

  getTotalSold() {
    return this.orderHistory.reduce((sum, order) => sum + order.quantity, 0);
  }
}

module.exports = { Product };
`;

fs.writeFileSync(userPath, userCode);
fs.writeFileSync(orderPath, orderCode);
fs.writeFileSync(productPath, productCode);

console.log('✅ Created:');
console.log('   • ex2-user.js');
console.log('   • ex2-order.js');
console.log('   • ex2-product.js\n');

console.log('══════════════════════════════════════════════');
console.log('🔴 The Problem');
console.log('══════════════════════════════════════════════\n');

console.log('Circular dependency chain:');
console.log('  User → Order → User (circular!)');
console.log('  Order → Product → Order (circular!)\n');

console.log('Try running this code:\n');

console.log(`
const { User } = require('./ex2-user');
const { Product } = require('./ex2-product');

const user = new User('Alice');
const product = new Product('Laptop', 1000);
const order = user.placeOrder(product, 2);

console.log(\`Order total: $\${order.getTotal()}\`);
`);

console.log('💥 This will likely fail or behave unexpectedly!\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 Your Tasks:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('Task 1: Identify the circular dependencies');
console.log('   • Draw the dependency graph');
console.log('   • Use: require.cache to inspect');
console.log('   • Tool: madge (npm install -g madge)\n');

console.log('Task 2: Choose a refactoring strategy:');
console.log('   Strategy A: Extract shared interface');
console.log('   Strategy B: Dependency injection');
console.log('   Strategy C: Lazy loading\n');

console.log('Task 3: Refactor the code');
console.log('   • Break the circular dependencies');
console.log('   • Keep the same functionality');
console.log('   • Make it testable\n');

console.log('Task 4: Test your solution');
console.log('   • Create a test file');
console.log('   • Verify all functionality works');
console.log('   • No circular dependencies remain\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('💡 Strategy Hints:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('Strategy A: Extract Shared Interface');
console.log('─────────────────────────────────────\n');
console.log('Create a types.js file:');
console.log('');
console.log('// types.js');
console.log('class BaseUser {');
console.log('  constructor(name) {');
console.log('    this.name = name;');
console.log('  }');
console.log('}');
console.log('');
console.log('class BaseOrder {');
console.log('  constructor(user, product, quantity) {');
console.log('    this.user = user;');
console.log('    this.product = product;');
console.log('    this.quantity = quantity;');
console.log('  }');
console.log('}');
console.log('');
console.log('module.exports = { BaseUser, BaseOrder };\n');

console.log('Then extend in user.js and order.js\n');

console.log('Strategy B: Dependency Injection');
console.log('─────────────────────────────────\n');
console.log('Don\'t import Order in User:');
console.log('');
console.log('class User {');
console.log('  placeOrder(OrderClass, product, quantity) {');
console.log('    const order = new OrderClass(this, product, quantity);');
console.log('    this.orders.push(order);');
console.log('    return order;');
console.log('  }');
console.log('}\n');

console.log('Strategy C: Lazy Loading');
console.log('────────────────────────\n');
console.log('Load dependencies inside methods:');
console.log('');
console.log('class User {');
console.log('  placeOrder(product, quantity) {');
console.log('    const { Order } = require("./order"); // Lazy!');
console.log('    const order = new Order(this, product, quantity);');
console.log('    return order;');
console.log('  }');
console.log('}\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ Success Criteria:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('• No circular dependencies');
console.log('• All original functionality works');
console.log('• Code is more maintainable');
console.log('• Can run: madge --circular . (shows nothing)\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🧪 Testing Your Solution:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('Create ex2-test.js:\n');

console.log(`
const { User } = require('./ex2-user-fixed');
const { Product } = require('./ex2-product-fixed');
const { Order } = require('./ex2-order-fixed');

// Test 1: Create user and product
const user = new User('Alice');
const product = new Product('Laptop', 1000);

console.log('✅ Created user and product');

// Test 2: Place order
const order = user.placeOrder(product, 2);
console.log('✅ Placed order');

// Test 3: Get total
console.log('Order total:', order.getTotal()); // Should be 2000

// Test 4: Get user info from order
console.log('User:', order.getUserName()); // Should be 'Alice'

// Test 5: Get total spent by user
console.log('Total spent:', user.getTotalSpent()); // Should be 2000

console.log('\\n✅ All tests passed!');
`);

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📚 Bonus Challenges:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('1. Convert solution to TypeScript with proper interfaces');
console.log('2. Implement the Observer pattern to avoid direct dependencies');
console.log('3. Create a factory pattern for creating orders');
console.log('4. Add unit tests with mocking\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🎯 Good luck! This is a common real-world problem!\n');
