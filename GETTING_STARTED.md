# 🚀 Getting Started - Node.js Backend Engineering Journey

Welcome to your 20-week transformation from React Developer to Backend Engineering expert!

---

## 📋 Prerequisites

### Required Software

**Node.js** (v18 or later)

```bash
node --version  # Should be v18+
npm --version   # Should be 9+
```

Install from: https://nodejs.org/

**Git**

```bash
git --version
```

**Code Editor**

- VS Code (recommended) or Cursor
- Install extensions: Node.js, ESLint, Prettier, Docker

**Docker & Docker Compose**

```bash
docker --version
docker-compose --version
```

Install from: https://www.docker.com/products/docker-desktop

### Database & Tools (Install as needed per project)

**PostgreSQL** (for Projects 1, 3, 5)

**Recommended Approach**: Start with direct install, switch to Docker later

- **Direct Install** (Weeks 1-2): https://www.postgresql.org/download/
  - Mac: `brew install postgresql@15`
  - Simpler for learning, better performance
  - Data persists automatically
- **Docker** (Week 3+):
  ```bash
  docker run -d --name postgres \
    -p 5432:5432 \
    -e POSTGRES_PASSWORD=password \
    -v postgres-data:/var/lib/postgresql/data \
    postgres:15
  ```
  - Isolated environment, easy cleanup
  - Good practice for production workflows

**Redis** (for Projects 1, 2, 4)

- **Direct Install**: https://redis.io/download/
  - Mac: `brew install redis`
- **Docker**:
  ```bash
  docker run -d --name redis \
    -p 6379:6379 \
    redis:7
  ```

**MongoDB** (optional, for comparison in Project 3)

- **Direct Install**: https://www.mongodb.com/try/download/community
  - Mac: `brew tap mongodb/brew && brew install mongodb-community`
- **Docker**:
  ```bash
  docker run -d --name mongo \
    -p 27017:27017 \
    mongo:7
  ```

> 💡 **Docker vs Direct Install**: Direct install is simpler and faster for learning. Docker provides isolation and is closer to production. Start simple, add Docker complexity as you get comfortable with databases.

### Optional but Recommended

- **Postman** or **Insomnia** - API testing
- **TablePlus** or **pgAdmin** - Database GUI
- **k6** or **Artillery** - Load testing (install when needed)

---

## 📁 Repository Structure

```
node-transition/
├── 00-fundamentals/          # Week 0.5 - Start here!
├── 01-project-url-shortener/ # Weeks 1-2
├── 02-project-chat-platform/ # Weeks 3-5
├── 03-project-ecommerce-api/ # Weeks 6-10
├── 04-project-microservices/ # Weeks 11-15
├── 05-project-analytics-api/ # Weeks 16-20
├── resources/                # Books, articles, cheatsheets
├── system-design-practice/   # Weekly exercises (start Week 6)
├── interview-prep/           # Optional parallel track
├── portfolio/                # Job search materials
└── weekly-logs/              # Your learning journal
```

---

## 🎯 Learning Path

### 1. Start with Fundamentals (Week 0.5 - Essential!)

**Location**: `00-fundamentals/`  
**Time**: 3-4 days (20-25 hours)  
**Do NOT skip this!**

```bash
cd 00-fundamentals
cat README.md  # Read the overview
```

Complete in order:

1. Runtime Architecture (4-6 hours) - Event loop, V8, libuv
2. Module System (2-3 hours) - CommonJS vs ESM
3. Streams (3-4 hours) - Readable, Writable, Transform
4. Buffers (2-3 hours) - Binary data handling
5. Error Handling (2-3 hours) - Patterns and best practices
6. Process & Globals (2 hours) - Signals, environment
7. Async Patterns (3-4 hours) - Promises, async/await

**Success Check**: Complete all 5 mini-projects in `00-fundamentals/mini-projects/`

### 2. Project 1: URL Shortener (Weeks 1-2)

**Location**: `01-project-url-shortener/`

```bash
cd 01-project-url-shortener
cat README.md  # Read requirements
cat THEORY_CHECKPOINTS.md  # Know when to pause and study
```

Build → Break → Optimize:

- Week 1: Get it working
- Week 2: Make it production-ready

### 3. Continue Through Projects 2-5

Follow the same pattern for each project:

1. Read `README.md` for requirements
2. Check `THEORY_CHECKPOINTS.md` for learning moments
3. Plan your architecture
4. Build in increments
5. Study theory just-in-time
6. Complete retrospective

### 4. Parallel Activities (Starting Week 6)

**System Design Practice**: Every week in `system-design-practice/`  
**Interview Prep**: Optional, 30 min/day in `interview-prep/`

---

## ⏰ Time Commitment

### Weekly Schedule (20-25 hours)

**Weekdays (Monday-Thursday)**: 2-3 hours/day

- Morning or evening coding sessions
- Focus on project work

**Mid-Week (Wednesday)**: 2-3 hours

- Theory deep dive
- Study concepts triggered by your work

**Friday**: 2-3 hours

- Code review & refactoring
- Write tests
- Update documentation

**Saturday**: 4-6 hours

- Major feature implementation
- Experiment with patterns
- System design practice (from Week 6)

**Sunday**: 4-6 hours

- Complete features
- Study blog posts & codebases
- Weekly retrospective (30 min)

**Total**: 20-25 hours/week

### Adjust to Your Schedule

- Can't do weekends? Spread over 5-6 days
- Busy week? Do minimum 15 hours
- Extra time? Go deeper into theory

---

## 📊 Track Your Progress

### Daily

- [ ] Code and commit frequently
- [ ] Document what you learned
- [ ] Note questions and blockers

### Weekly

- [ ] Fill out `weekly-logs/week-XX.md`
- [ ] Complete retrospective template
- [ ] Update `PROGRESS_TRACKER.md`
- [ ] Commit your work

### Per Project

- [ ] Complete all requirements
- [ ] Write documentation
- [ ] Run load tests
- [ ] Complete comparison study
- [ ] Update portfolio

---

## 🔧 Development Setup

### 1. Clone and Initial Setup

```bash
# Already done if you're reading this!
cd node-transition
npm init -y  # If needed for any global scripts
```

### 2. Git Configuration

```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Recommended: conventional commits
git config --global commit.template .gitmessage  # Optional
```

### 3. VS Code Setup

Install recommended extensions:

- ES7+ React/Redux/React-Native snippets
- ESLint
- Prettier
- Docker
- GitLens
- Thunder Client (API testing)

### 4. Node.js Tools

```bash
# Install globally (optional)
npm install -g nodemon      # Auto-restart on changes
npm install -g npm-check    # Check for outdated packages
npm install -g clinic       # Performance profiling
```

---

## 📚 Essential Resources

### Keep These Handy

**Documentation**:

- [Node.js Docs](https://nodejs.org/docs/latest/api/)
- [MDN Web Docs](https://developer.mozilla.org/en-US/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

**In This Repo**:

- `resources/cheatsheets/` - Quick reference guides
- `00-fundamentals/VISUAL_GUIDE.md` - Diagrams and visuals
- Each project's `THEORY_CHECKPOINTS.md`

**External**:

- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [System Design Primer](https://github.com/donnemartin/system-design-primer)

---

## 🎯 Success Indicators

### After Fundamentals (Week 0.5)

✅ Can explain the event loop phases  
✅ Understand async patterns deeply  
✅ Can work with streams and buffers  
✅ Proper error handling is second nature

### After Project 1 (Week 2)

✅ Built and deployed a real API  
✅ Understand database optimization  
✅ Can implement caching effectively  
✅ Know how to handle scale

### After Project 3 (Week 10)

✅ Can design complex data models  
✅ Handle transactions properly  
✅ Write comprehensive tests  
✅ Integrate external services

### After Project 5 (Week 20)

✅ Build production systems from scratch  
✅ Make informed architectural decisions  
✅ Debug complex issues systematically  
✅ Ready for backend engineering roles

---

## 💡 Learning Tips

### The 70-20-10 Framework

- **70% Project Work**: Build, code, implement
- **20% Theory**: Study just-in-time when you hit a problem
- **10% Exploration**: Read blogs, study other code

### When Stuck

1. Try for 30 minutes yourself
2. Search for the error/problem
3. Check official documentation
4. Ask in community (with context)
5. If really stuck, move on and return later

**Remember**: Being stuck is where learning happens!

### Avoid Burnout

- Take breaks every 90 minutes
- One full day off per week
- If motivation dips, review what you've built
- Focus on depth over speed

---

## 🚦 Ready to Start?

### Day 1 Checklist

- [ ] All prerequisites installed
- [ ] Repository cloned and explored
- [ ] Read `README.md` (main roadmap)
- [ ] Read this file completely
- [ ] Set up your development environment
- [ ] Create `weekly-logs/week-00-fundamentals.md`
- [ ] Start `00-fundamentals/01-runtime-architecture/`

### Your First Commands

```bash
# Start with fundamentals
cd 00-fundamentals/01-runtime-architecture

# Run your first example
node 01-event-loop/event-loop-phases.js

# You're on your way! 🎉
```

---

## 🆘 Need Help?

### Resources in This Repo

- Check `resources/tools/troubleshooting/`
- Each folder has its own README
- Look for similar issues in project docs

### External Communities

- Node.js Discord
- Reddit: r/node, r/backend
- Stack Overflow (search first!)

### Documentation

- Always check official docs first
- Use `--help` flag with commands
- Read error messages carefully

---

## 🎉 Let's Build!

You're about to embark on an intensive 20-week journey. You'll:

- Build 5 production-ready projects
- Learn distributed systems
- Master database optimization
- Understand system design
- Become a backend engineer

**Every expert was once a beginner. Your journey starts now.**

**Next Step**: Open `00-fundamentals/README.md` and begin!

---

_Last Updated: November 2025_  
_Questions? Document them in your weekly logs!_
