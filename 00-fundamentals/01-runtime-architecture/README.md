# Node.js Runtime Architecture - Learning Guide

## 🎯 Learning Path

Work through these modules in order:

### 1. Event Loop (Start Here!)
- `01-event-loop/event-loop-phases.js` - Understand the 6 phases
- `01-event-loop/microtasks-vs-macrotasks.js` - Priority system
- `01-event-loop/timing-comparison.js` - When to use what

**Exercise**: `exercises/exercise-1-event-loop.js`

### 2. V8 Engine
- `02-v8-engine/v8-memory-gc.js` - Memory management & GC

**Exercise**: `exercises/exercise-3-v8-optimization.js`

### 3. libuv Thread Pool
- `03-libuv-threadpool/threadpool-demo.js` - What uses threads

**Exercise**: `exercises/exercise-2-threadpool.js`

---

## 🚀 Quick Start

Run any example:
```bash
node 01-event-loop/event-loop-phases.js
```

Run with garbage collection access:
```bash
node --expose-gc 02-v8-engine/v8-memory-gc.js
```

Run with increased thread pool:
```bash
UV_THREADPOOL_SIZE=8 node 03-libuv-threadpool/threadpool-demo.js
```

---

## 📝 Study Method

For each module:

1. **Read the code** - Don't just run it, read comments first
2. **Predict output** - Write down what you think will happen
3. **Run and compare** - See if your prediction was correct
4. **Modify** - Change values, add code, break things
5. **Do the exercise** - Test your understanding

---

## 🎓 Key Concepts to Master

### Event Loop
- ✅ 6 phases and their order
- ✅ Microtasks (nextTick, Promise) vs Macrotasks (setTimeout, setImmediate)
- ✅ When to use each timing mechanism
- ✅ How to avoid blocking the event loop
- ✅ Difference between I/O context and main module

### V8 Engine
- ✅ Stack vs Heap memory
- ✅ Hidden classes and object optimization
- ✅ Garbage collection (young vs old generation)
- ✅ Common memory leak patterns
- ✅ How to monitor memory usage

### libuv Thread Pool
- ✅ What operations use threads (fs, crypto, dns.lookup, zlib)
- ✅ What doesn't use threads (network I/O)
- ✅ Thread pool size and saturation
- ✅ When to increase UV_THREADPOOL_SIZE
- ✅ Alternative: Worker Threads for CPU-intensive work

---

## 🔧 Debugging Tools

### Inspect with Chrome DevTools
```bash
node --inspect script.js
# Then open chrome://inspect in Chrome
```

### CPU Profiling
```bash
node --prof script.js
node --prof-process isolate-*.log > processed.txt
```

### Trace Optimizations
```bash
node --trace-opt script.js
node --trace-deopt script.js
```

### Memory Analysis
```bash
node --trace-gc script.js
```

### Use clinic.js for Performance
```bash
npm install -g clinic
clinic doctor -- node script.js
clinic flame -- node script.js
```

---

## ✅ Self-Assessment Quiz

After completing all modules, answer these:

1. What are the 6 phases of the event loop?
2. Why does process.nextTick() run before Promise callbacks?
3. When should you use setImmediate vs setTimeout?
4. What is a hidden class in V8?
5. Why does property order matter in objects?
6. What operations use the thread pool?
7. How would you increase thread pool size and why?
8. What's the difference between young and old generation in GC?
9. How can you detect memory leaks?
10. What's the risk of recursive process.nextTick()?

If you can answer all 10, you're ready to move on! 🎉

---

## 📚 Further Reading

- [Node.js Event Loop Official Docs](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
- [V8 Documentation](https://v8.dev/docs)
- [libuv Design Overview](http://docs.libuv.org/en/v1.x/design.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## 🎯 Next Steps

After mastering the runtime architecture:
1. Move on to **Streams** (Phase 1, next in your roadmap)
2. Study **Module System** (CommonJS vs ESM)
3. Deep dive into **Error Handling Patterns**
4. Start **Project 1: URL Shortener** (apply what you learned!)

---

## 💡 Pro Tips

1. **Run examples multiple times** - Notice variations in timing
2. **Use console.time()** - Measure performance yourself
3. **Break things intentionally** - Remove code, see what happens
4. **Read Node.js source code** - Check how things work internally
5. **Profile everything** - Use --inspect regularly

Remember: Understanding the runtime deeply makes you a better Node.js developer!
