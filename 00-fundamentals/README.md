# 🎓 Node.js Fundamentals - Week 0.5

**Time Required**: 3-4 days (20-25 hours total)  
**Critical**: Complete before starting Project 1!

---

## 🎯 Overview

These fundamentals are the foundation of everything you'll build. Node.js is different from browser JavaScript, and understanding these core concepts deeply will make you a significantly better backend engineer.

**Don't skip this section!** The time invested here will save you countless hours of confusion later.

---

## 📚 Learning Modules

Complete in this order:

### 1. Runtime Architecture (4-6 hours) ⭐ **START HERE**
**Location**: `01-runtime-architecture/`

- Event Loop (6 phases, microtasks, macrotasks)
- V8 Engine (memory model, GC, optimization)
- libuv Thread Pool (what uses threads vs async I/O)

**Why it matters**: Understanding the event loop is crucial for writing performant async code. You'll know why your code behaves the way it does.

**Success check**: Can you explain the event loop phases? Know when to use nextTick vs setImmediate?

---

### 2. Module System (2-3 hours)
**Location**: `02-module-system/`

- CommonJS (`require`, `module.exports`)
- ES Modules (`import`, `export`)
- Module resolution and caching
- Circular dependencies

**Why it matters**: Modern Node.js uses both module systems. You need to know when to use each and how they differ.

**Success check**: Can you explain the difference between `require()` and `import`? Understand module caching?

---

### 3. Streams (3-4 hours) ⭐ **IMPORTANT**
**Location**: `03-streams/`

- Readable, Writable, Duplex, Transform
- Backpressure handling
- Piping and chaining
- `stream.pipeline()`

**Why it matters**: Streams are fundamental to Node.js. They're how you process large files, handle HTTP requests, and manage data efficiently.

**Success check**: Can you process a 1GB file without loading it into memory? Understand backpressure?

---

### 4. Buffers & Binary Data (2-3 hours)
**Location**: `04-buffers/`

- Buffer creation and manipulation
- String encodings (utf8, base64, hex)
- Performance considerations
- Binary protocol parsing

**Why it matters**: Working with binary data is common in backend systems (files, network protocols, cryptography).

**Success check**: Can you convert between strings and buffers? Understand when to use buffers vs strings?

---

### 5. Error Handling (2-3 hours) ⭐ **CRITICAL**
**Location**: `05-error-handling/`

- Callback error-first pattern
- Promise rejection handling
- `async/await` error patterns
- Custom error classes
- Operational vs programmer errors

**Why it matters**: Proper error handling is what separates hobby projects from production systems.

**Success check**: Can you handle errors properly in async code? Create meaningful custom errors?

---

### 6. Process & Global Objects (2 hours)
**Location**: `06-process-globals/`

- Environment variables
- Process signals (SIGTERM, SIGINT)
- Graceful shutdown patterns
- Process exit codes

**Why it matters**: Production applications need to handle signals properly and shut down gracefully.

**Success check**: Can you implement graceful shutdown? Handle environment variables properly?

---

### 7. Async Patterns (3-4 hours) ⭐ **ESSENTIAL**
**Location**: `07-async-patterns/`

- Callbacks, Promises, async/await
- Promise.all, race, allSettled, any
- Async iteration
- Concurrency control
- Parallel vs sequential execution

**Why it matters**: Async programming is the heart of Node.js. Master these patterns or struggle constantly.

**Success check**: Can you control concurrency? Know when to use each Promise method?

---

## 🛠️ Mini-Projects

**Location**: `mini-projects/`

After completing all 7 modules, build these 5 mini-projects to cement your understanding:

### 1. File Processor with Streams
Build a tool that processes large CSV files using streams (read, transform, write).

### 2. Event Loop Demonstrator
Create a visual demo showing event loop phases and timing.

### 3. Graceful Shutdown Server
HTTP server that handles SIGTERM properly, finishes requests, closes connections.

### 4. Async Queue with Concurrency
Queue that processes items with configurable concurrency limit.

### 5. Custom Error Hierarchy
Application error system with different error types and proper handling.

---

## 📖 Study Method

For each module:

### 1. Read (30 min)
- Open the module's README
- Read all the theory
- Study the visual diagrams

### 2. Explore Examples (1-2 hours)
- Read example code (don't just run it!)
- Predict what will happen
- Run the examples
- Compare your prediction

### 3. Experiment (1 hour)
- Modify the examples
- Break things intentionally
- Add console.logs everywhere
- Test edge cases

### 4. Exercise (1-2 hours)
- Complete the exercises
- Don't look at solutions immediately
- Struggle is where learning happens

### 5. Review (30 min)
- Can you explain it to someone?
- Answer the self-check questions
- Note what's still unclear

---

## ✅ Completion Criteria

Before moving to Project 1, you should:

### Knowledge Checks
- [ ] Explain event loop phases without looking
- [ ] Know when to use each async timing mechanism
- [ ] Understand V8 memory model and GC
- [ ] Explain what uses thread pool vs async I/O
- [ ] Can choose between CommonJS and ESM
- [ ] Work comfortably with streams
- [ ] Handle buffers and encoding
- [ ] Implement proper error handling
- [ ] Handle process signals correctly
- [ ] Control async operation concurrency

### Practical Skills
- [ ] Completed all 5 mini-projects
- [ ] Can debug async code effectively
- [ ] Can profile memory and CPU
- [ ] Understand the tools (`--inspect`, `--trace-gc`, etc.)

### Confidence Level
- [ ] Feel ready to start building projects
- [ ] Know where to look when stuck
- [ ] Understand the "why" not just "how"

**If you can check all these boxes, you're ready for Project 1! 🚀**

---

## 🎯 Time Management

### If You Have 3 Days (Intensive)
- **Day 1**: Modules 1-3 (Runtime, Modules, Streams) - 10 hours
- **Day 2**: Modules 4-7 (Buffers, Errors, Process, Async) - 10 hours
- **Day 3**: All 5 mini-projects - 6 hours

### If You Have 4 Days (Recommended)
- **Day 1**: Module 1 (Runtime Architecture) - 6 hours
- **Day 2**: Modules 2-4 (Modules, Streams, Buffers) - 7 hours
- **Day 3**: Modules 5-7 (Errors, Process, Async) - 7 hours
- **Day 4**: All 5 mini-projects - 6 hours

### If You Have More Time (Deep Dive)
- Spend 1 day per module
- Go deep into each topic
- Read external articles
- Explore Node.js source code

---

## 📚 Resources

### Within This Repo
- `VISUAL_GUIDE.md` - Diagrams and visual explanations (highly recommended!)
- Each module's README has theory and examples
- Exercises with solutions (try before peeking!)

### External Resources
- [Node.js Official Docs](https://nodejs.org/docs/latest/api/)
- [Node.js Event Loop Guide](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
- [Stream Handbook](https://github.com/substack/stream-handbook)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

### Books (Optional Deep Dive)
- "Node.js Design Patterns" - Read Part 1 during fundamentals
- Official Node.js documentation (reference)

---

## 💡 Learning Tips

### Active Learning
- **Type the code**, don't copy-paste
- **Break things** - remove code, see what happens
- **Add logging** - console.log everywhere
- **Explain out loud** - rubber duck debugging

### Common Pitfalls
- ❌ Rushing through to get to projects
- ❌ Just running examples without understanding
- ❌ Skipping exercises
- ❌ Not experimenting and modifying code

### Best Practices
- ✅ Take notes in your own words
- ✅ Create your own examples
- ✅ Struggle with exercises before checking solutions
- ✅ Review at the end of each day

---

## 🔄 If You Get Stuck

### Normal Confusion Points
1. **Event loop phases**: Draw it out, run examples slowly
2. **Streams**: Start simple, build complexity gradually
3. **Async patterns**: Practice, practice, practice
4. **Buffers**: Work with small examples first

### Resources When Stuck
1. Re-read the module README
2. Check VISUAL_GUIDE.md for diagrams
3. Run examples with added console.logs
4. Search official Node.js docs
5. Take a break and come back

**Remember**: Being confused is normal and means you're learning!

---

## 🎓 After Completion

### Celebrate! 🎉
You've completed the foundational knowledge that most Node.js developers skip. This investment will pay dividends throughout your journey.

### Next Steps
1. Review your notes from all 7 modules
2. Pick your strongest and weakest areas
3. Create a personal cheatsheet
4. Move to `01-project-url-shortener/`

### Keep This Handy
You'll refer back to fundamentals constantly during projects. That's normal and expected!

---

## 📊 Module Overview Table

| Module | Time | Difficulty | Importance | When You'll Use It |
|--------|------|------------|------------|-------------------|
| 1. Runtime | 4-6h | ⭐⭐⭐ | 🔥🔥🔥 | Every single day |
| 2. Modules | 2-3h | ⭐⭐ | 🔥🔥🔥 | Every project |
| 3. Streams | 3-4h | ⭐⭐⭐⭐ | 🔥🔥🔥 | File processing, HTTP |
| 4. Buffers | 2-3h | ⭐⭐⭐ | 🔥🔥 | Binary data, files |
| 5. Errors | 2-3h | ⭐⭐ | 🔥🔥🔥 | Every single day |
| 6. Process | 2h | ⭐⭐ | 🔥🔥 | Production apps |
| 7. Async | 3-4h | ⭐⭐⭐⭐ | 🔥🔥🔥 | Every single day |

**Total**: 20-25 hours over 3-4 days

---

**Ready to start?** Open `01-runtime-architecture/README.md` and begin your journey!

*Remember: These fundamentals are your superpower. Invest the time now, reap the benefits forever.*
