# Week 00 - Fundamentals & Setup

**Date Started**: November 5, 2025  
**Phase**: Pre-Project Setup & Environment Configuration  
**Focus**: Development environment setup, Node.js runtime fundamentals

---

## 🎯 Goals for This Week

- [x] Set up development environment (PostgreSQL, tools)
- [ ] Complete Node.js Runtime Architecture section
- [ ] Study event loop, V8 engine, libuv
- [ ] Complete all fundamental topics (modules, streams, buffers, etc.)
- [ ] Finish 5 mini-projects
- [ ] Feel confident about Node.js internals

---

## 📅 Daily Log

### Tuesday, November 5, 2025

**Time Spent**: 1 hour

**What I Did**:

1. ✅ Organized repository structure with learning materials
2. ✅ Created complete 20-week learning framework
3. ✅ Installed PostgreSQL 18.0 via Homebrew
4. ✅ Configured PostgreSQL service and PATH
5. ✅ Verified installation and database connectivity
6. ✅ Documented setup process in detail

**Technical Setup Completed**:

- PostgreSQL 18.0 (Homebrew) installed and running
- Service configured to auto-start
- `psql` command working
- Default database accessible
- All dependencies installed (icu4c, krb5, etc.)

**What I Learned**:

- PostgreSQL on Apple Silicon uses native ARM64 builds (optimal performance)
- Homebrew's "keg-only" installations require manual PATH setup
- PostgreSQL 18 includes improved SQL/JSON support
- Default peer authentication works for local development (no password needed)
- Service management via `brew services` is clean and reliable
- **Daemons**: Background processes that run continuously (like postgres, redis)
  - Run invisibly, provide services to other programs
  - Auto-restart if they crash, auto-start on login
  - Convention: often named with 'd' suffix (httpd, sshd, mysqld)
- **brew services**: User-friendly wrapper around macOS launchctl
  - Simplifies daemon management (start/stop/restart)
  - Creates Launch Agent plist files automatically
  - Much easier than manual launchctl commands

**Challenges Faced**:

- `psql` command not found initially after installation
- **Solution**: Added PostgreSQL bin directory to PATH in `.zshrc`
- **Learning**: Homebrew doesn't symlink versioned packages by default

**Resources Used**:

- PostgreSQL 18 documentation
- Homebrew formula reference
- Setup guide created in `docs/project-meta/2025-11-05_SETUP_LOG.md`
- Daemon & brew services guide in `resources/tools/brew-services-and-daemons.md`

---

## 📝 This Week's Progress

### Environment Setup ✅

- [x] PostgreSQL 18 installed and configured
- [ ] Redis installation
- [ ] Docker Desktop (optional for later)
- [ ] Database GUI tool (TablePlus or pgAdmin)
- [ ] Postman/Insomnia for API testing

### Fundamentals Learning

- [ ] 01-runtime-architecture (4-6 hours)
  - [ ] Event loop phases
  - [ ] V8 engine and memory management
  - [ ] libuv thread pool
  - [ ] Complete exercises
- [ ] 02-module-system (2-3 hours)
- [ ] 03-streams (3-4 hours)
- [ ] 04-buffers (2-3 hours)
- [ ] 05-error-handling (2-3 hours)
- [ ] 06-process-globals (2 hours)
- [ ] 07-async-patterns (3-4 hours)

### Mini-Projects

- [ ] 01-file-processor
- [ ] 02-event-loop-demo
- [ ] 03-graceful-shutdown
- [ ] 04-async-queue
- [ ] 05-error-hierarchy

---

## 💡 Key Insights

### Technical

1. **PostgreSQL 18 Features**: Latest version brings performance improvements and better JSON support - good for modern APIs
2. **ARM64 Native**: Using native Apple Silicon builds ensures best performance (no Rosetta translation)
3. **Development Setup**: Direct install is indeed simpler for learning - can focus on Node.js without Docker complexity
4. **Background Services**: Daemons run continuously in background, providing services without manual intervention
5. **Service Management**: `brew services` wraps macOS launchctl, making daemon control user-friendly

### Learning Approach

1. **Documentation First**: Thorough documentation of setup helps when troubleshooting later
2. **Progressive Complexity**: Starting with direct install before Docker is the right call - one new thing at a time
3. **Git Tracking**: Using dated files in `project-meta/` creates good historical record
4. **Deep Understanding**: Don't just run commands - understand what they do (daemons, services, etc.)

---

## 🤔 Questions & Notes

### Questions to Research

- [ ] What are the main differences between PostgreSQL 18 and 17?
- [ ] When should I use connection pooling in Node.js?
- [ ] How does libuv thread pool size affect database connections?
- [x] What is a daemon? → Background process running continuously
- [x] What is brew services? → macOS service management wrapper for launchctl
- [x] How do services auto-start on macOS? → Launch Agents in ~/Library/LaunchAgents/

### Notes for Next Time

- Remember to stop PostgreSQL service when not in use (save battery)
- Use `brew services list` to check what's running
- Create project databases with descriptive names
- Document connection strings for each project

---

## 📊 Time Breakdown

| Activity                | Time Spent |
| ----------------------- | ---------- |
| Repository organization | 30 min     |
| PostgreSQL installation | 15 min     |
| Configuration & testing | 10 min     |
| Documentation           | 5 min      |
| **Total**               | **1 hour** |

**Remaining this week**: 19-24 hours

---

## 🎯 Tomorrow's Plan (Wednesday, Nov 6)

**Focus**: Start Runtime Architecture fundamentals

**Tasks**:

1. [ ] Read `00-fundamentals/01-runtime-architecture/README.md`
2. [ ] Study event loop phases
3. [ ] Run `event-loop-phases.js` example
4. [ ] Work through microtasks vs macrotasks
5. [ ] Complete Exercise 1

**Time Allocation**: 2-3 hours

**Goal**: Understand how Node.js event loop works

---

## 🚀 Week Goals Status

**Overall Progress**: 5% (setup complete, ready to start learning)

**Confidence Level**: 8/10 on environment setup, ready to dive into fundamentals

**Motivation**: High - excited to understand Node.js internals deeply

---

## 📚 Resources Discovered

### Documentation Created

- `docs/project-meta/2025-11-05_SETUP_LOG.md` - PostgreSQL installation details
- `resources/tools/setup-guides/docker-vs-direct-install.md` - Comprehensive comparison
- `resources/tools/brew-services-and-daemons.md` - Background services & process management

### External Resources

- PostgreSQL 18 Release Notes
- Homebrew PostgreSQL Formula docs
- macOS launchctl documentation

---

## 🎨 Reflections

### What Went Well

- ✅ Smooth PostgreSQL installation with no major issues
- ✅ Good documentation habit established from day 1
- ✅ Repository structure is clear and well-organized
- ✅ Setup logging will be valuable reference later
- ✅ Asked questions about unfamiliar concepts (daemons, brew services)
- ✅ Created comprehensive reference guides for future use

### What Could Be Better

- ⚠️ Could have researched PATH setup before installation (would have saved 5 min)
- ⚠️ Should verify all prerequisites before starting (check Node.js version, etc.)

### Surprises

- 😮 PostgreSQL 18 is very recent (released Oct 2024) - cutting edge!
- 😮 ARM64 native build is noticeably fast to start
- 😮 No password needed for local development (peer authentication)
- 😮 PostgreSQL spawns multiple helper processes (not just one daemon)
- 😮 brew services creates Launch Agent files automatically
- 😮 Daemons can auto-restart if they crash (KeepAlive configuration)

---

## 📋 Blockers & Solutions

**None encountered yet** - setup went smoothly

---

## Next Session Preview

**Topic**: Node.js Event Loop  
**Materials**: `00-fundamentals/01-runtime-architecture/01-event-loop/`  
**Expected Outcome**: Deep understanding of event loop phases and execution order

**Preparation**:

- Review existing knowledge of async JavaScript
- Have Node.js REPL ready for experimentation
- Keep notes on questions that arise

---

_Ready to begin the learning journey! 🚀_
