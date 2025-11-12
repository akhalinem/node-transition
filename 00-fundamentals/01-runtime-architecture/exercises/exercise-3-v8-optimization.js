/**
 * EXERCISE 3: Memory & Hidden Classes
 * 
 * Your task: Understand V8 optimization and write performant code
 */

console.log('=== EXERCISE 3: V8 Optimization ===\n');

/**
 * PART 1: Hidden Class Consistency
 * Compare performance of consistent vs inconsistent object creation
 */

function testConsistentObjects() {
  const start = Date.now();
  const objects = [];
  
  // Consistent structure - all objects share same hidden class
  for (let i = 0; i < 10_000_000; i++) {
    objects.push({
      id: i,
      name: `User ${i}`,
      age: 25,
      active: true
    });
  }
  
  // Access property 10 million times
  let sum = 0;
  for (let obj of objects) {
    sum += obj.age;
  }
  
  return Date.now() - start;
}

function testInconsistentObjects() {
  const start = Date.now();
  const objects = [];
  
  // Inconsistent structure - different hidden classes
  for (let i = 0; i < 10_000_000; i++) {
    if (Math.random() < 0.5) {
      objects.push({
        id: i,
        name: `User ${i}`,
        age: 25,
        active: true
      });
    } else {
      objects.push({
        active: false,
        age: 22,
        name: `Inactive User ${i}`,
        id: i+1
      });
    }
  }
  
  // Access property 10 million times
  let sum = 0;
  for (let obj of objects) {
    sum += obj.age;
  }
  
  return Date.now() - start;
}

console.log('Running performance comparison...\n');

const consistentTime = testConsistentObjects();
console.log(`Consistent objects: ${consistentTime}ms`);

const inconsistentTime = testInconsistentObjects();
console.log(`Inconsistent objects: ${inconsistentTime}ms`);

const diff = ((inconsistentTime - consistentTime) / consistentTime * 100).toFixed(2);
console.log(`Difference: ${diff}% slower with inconsistent structure\n`);

/**
 * PART 2: Dynamic Property Addition
 * Test the cost of adding properties after object creation
 */

function testStaticProperties() {
  const start = Date.now();
  
  for (let i = 0; i < 10_000_000; i++) {
    const obj = {
      id: i,
      name: `User ${i}`,
      age: 25,
      email: `user${i}@test.com`
    };
    // All properties defined upfront
  }
  
  return Date.now() - start;
}

function testDynamicProperties() {
  const start = Date.now();
  
  for (let i = 0; i < 10_000_000; i++) {
    const obj = {
      id: i,
      name: `User ${i}`
    };
    obj.age = 25; // Added later - causes hidden class change!
    obj.email = `user${i}@test.com`;
  }
  
  return Date.now() - start;
}

console.log('Testing dynamic property addition...\n');

const staticTime = testStaticProperties();
console.log(`Static properties: ${staticTime}ms`);

const dynamicTime = testDynamicProperties();
console.log(`Dynamic properties: ${dynamicTime}ms`);

const dynamicDiff = ((dynamicTime - staticTime) / staticTime * 100).toFixed(2);
console.log(`Difference: ${dynamicDiff}% slower with dynamic properties\n`);

/**
 * YOUR EXPERIMENTS:
 * 
 * 1. Constructor Functions vs Object Literals:
 *    Create 1M objects with a constructor function vs object literals.
 *    Which is faster? Why?
 * 
 * 2. Property Deletion:
 *    Test the cost of using `delete obj.property`.
 *    Hint: It's VERY expensive! What's the alternative?
 * 
 * 3. Array Performance:
 *    Create arrays with holes (e.g., arr[0] = 1; arr[1000] = 2)
 *    vs dense arrays. Compare performance.
 * 
 * 4. Class vs Object Literal:
 *    Compare ES6 class instantiation vs object literals.
 *    Any performance difference?
 * 
 * QUESTIONS TO ANSWER:
 * 
 * 1. Why does property order matter?
 * 2. What are "hidden classes" and how do they work?
 * 3. When would dynamic properties be acceptable?
 * 4. How can you check if your code is optimized?
 *    Hint: Use --trace-opt and --trace-deopt flags
 * 
 * BONUS CHALLENGE:
 * Create a "factory function" that creates objects with
 * the same hidden class, even when properties are optional.
 * Example: All properties are always defined, but some might be null.
 */

console.log('Memory usage after tests:');
const mem = process.memoryUsage();
console.log(`Heap Used: ${Math.round(mem.heapUsed / 1024 / 1024)} MB`);

console.log('\n🎯 Key Takeaway:');
console.log('V8 optimizes based on object shape consistency.');
console.log('Keep your object structures predictable for best performance!\n');
