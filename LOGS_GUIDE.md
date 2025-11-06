# Logs Guide

Simple chronological logging system for your learning journey.

---

## The System

**One file**: `LOGS.md` at the root  
**Format**: Timestamped entries in chronological order  
**Organized by**: Month → Day headers

---

## Quick Usage

### Manual (Recommended)

Just open `LOGS.md` and type:

```markdown
**14:23** - Started working on event loop examples
```

### With Helper Script

```bash
# Make log.sh accessible
chmod +x log.sh

# Use it
./log.sh "Your log entry"
```

Or add alias to `~/.zshrc`:

```bash
alias log='~/Programming/learning/NodeJS/node-transition/log.sh'
```

Then:

```bash
log "Started event loop study"
log "Completed exercise 1"
```

---

## Format Example

```markdown
### Thursday, November 7

**09:00** - Session started - Runtime architecture study
**09:30** - Learned about event loop phases
**11:00** - Completed exercises
**11:30** - Session ended (2.5 hours)

Key learning: Microtasks run between every event loop phase
```

---

## Tips

### Keep It Brief

```markdown
✅ **14:23** - Completed event loop exercises
❌ **14:23** - Today I worked on the event loop exercises and learned about...
```

### Log Key Moments

- Session starts/ends
- Breakthroughs
- Problems/solutions
- Questions

### Optional: Use Emoji

```markdown
**09:00** 🚀 Session started
**10:30** 💡 Aha moment
**11:00** ✅ Complete
**11:30** 🐛 Bug found
**12:00** 🎯 Fixed
```

---

## VS Code Snippet (Best for frequent logging)

Add to `markdown.json`:

```json
{
  "Log Entry": {
    "prefix": "log",
    "body": ["**${CURRENT_HOUR}:${CURRENT_MINUTE}** - $0"]
  }
}
```

Type `log` + Tab = instant timestamped entry!

---

## Why This Works

- **One file**: Easy to find and search
- **Chronological**: Natural timeline
- **Low friction**: Just open and type
- **Permanent record**: Your entire journey

---

## Quick Commands

```bash
# View recent entries
tail -20 LOGS.md

# Search for topic
grep "event loop" LOGS.md

# See today's entries
grep "November 7" LOGS.md -A 20

# Count total entries
grep "\*\*[0-9][0-9]:[0-9][0-9]\*\*" LOGS.md | wc -l
```

---

**Keep it simple. Log as you go. That's it.** 🎯
