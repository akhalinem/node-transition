/**
 * Practical Example: Detecting Event Loop Blocking
 * Learn how to monitor and prevent event loop blocking in production
 */

const startTime = Date.now();

// Monitor event loop lag
function monitorEventLoop() {
  let lastCheck = Date.now();
  
  setInterval(() => {
    const now = Date.now();
    const lag = now - lastCheck - 100; // Expected interval is 100ms
    
    if (lag > 10) {
      console.log(`⚠️  Event loop lag detected: ${lag}ms`);
    }
    
    lastCheck = now;
  }, 100);
}

monitorEventLoop();

console.log('=== Example 1: Non-blocking async operation (GOOD) ===\n');

// Good: Non-blocking file read
const fs = require('fs').promises;

async function goodAsyncOperation() {
  console.log('Reading file asynchronously...');
  const data = await fs.readFile(__filename, 'utf8');
  console.log(`✅ File read complete (${data.length} bytes)`);
  console.log('Event loop was NOT blocked\n');
}

goodAsyncOperation();
console.log('Doing other work while file is being read...\n');

// Give it time to complete
setTimeout(() => {
  console.log('=== Example 2: Blocking synchronous operation (BAD) ===\n');
  
  // Bad: Blocking file read
  const fs = require('fs');
  
  console.log('Reading file synchronously...');
  const start = Date.now();
  const data = fs.readFileSync(__filename, 'utf8');
  const duration = Date.now() - start;
  
  console.log(`💥 File read complete (${data.length} bytes) - took ${duration}ms`);
  console.log('Event loop WAS BLOCKED for the entire duration!\n');
  
  setTimeout(() => {
    console.log('=== Example 3: Heavy computation (BLOCKING) ===\n');
    
    function fibonacci(n) {
      if (n <= 1) return n;
      return fibonacci(n - 1) + fibonacci(n - 2);
    }
    
    console.log('Computing fibonacci(40)...');
    const start = Date.now();
    const result = fibonacci(40);
    const duration = Date.now() - start;
    
    console.log(`💥 Result: ${result} - took ${duration}ms`);
    console.log('Event loop was BLOCKED - no other operations could run!\n');
    
    setTimeout(() => {
      console.log('=== Example 4: Breaking up work (GOOD) ===\n');
      
      function processArrayAsync(array, processItem, callback) {
        let index = 0;
        
        function processNext() {
          // Process one item
          if (index < array.length) {
            processItem(array[index]);
            index++;
            
            // Give event loop a chance to process other tasks
            setImmediate(processNext);
          } else {
            callback();
          }
        }
        
        processNext();
      }
      
      const largeArray = Array.from({ length: 1000 }, (_, i) => i);
      let processedCount = 0;

      console.log('Processing 1000 items with event loop breaks...');
      const start = Date.now();
      
      processArrayAsync(
        largeArray,
        (item) => {
          console.log(`Processing item ${item}`);

          // Simulate some work
          processedCount++;
        },
        () => {
          console.log(`✅ Processed ${processedCount} items in ${Date.now() - start}ms`);
          console.log('Event loop could process other tasks between items!\n');
          
          // finishDemo();
        }
      );

       setInterval(() => {
        console.log(`Heartbeat ${processedCount} - Event loop is responsive`);
        if (processedCount === largeArray.length) {
          finishDemo();
        }
      }, 500);
    }, 1000);
  }, 1000);
}, 500);

function finishDemo() {
  console.log('=== Best Practices ===\n');
  console.log('✅ DO:');
  console.log('  - Use async I/O operations (fs.promises, not fs.*Sync)');
  console.log('  - Break up CPU-intensive work with setImmediate()');
  console.log('  - Use Worker Threads for heavy computation');
  console.log('  - Monitor event loop lag in production');
  console.log('  - Use streaming for large data processing\n');
  
  console.log('❌ DON\'T:');
  console.log('  - Use *Sync functions in request handlers');
  console.log('  - Run heavy computations in main thread');
  console.log('  - Block the event loop for more than 10ms');
  console.log('  - Use JSON.parse() on huge strings without streaming\n');
  
  console.log('🔧 Tools to detect blocking:');
  console.log('  - blocked-at npm package');
  console.log('  - clinic.js doctor');
  console.log('  - --trace-warnings flag');
  console.log('  - Custom event loop monitoring\n');
  
  // Stop monitoring
  process.exit(0);
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  process.exit(0);
});

console.log('END OF DEMONSTRATION\n');
