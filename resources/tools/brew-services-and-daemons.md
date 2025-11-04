# Understanding Daemons and brew services

**Date**: November 5, 2025  
**Topic**: Background services, process management, and macOS service control  
**Context**: Learning how PostgreSQL runs in the background during setup

---

## What is a Daemon?

A **daemon** is a background process that runs continuously without direct user interaction.

### Etymology

- Name comes from Greek mythology (δαίμων - helpful spirit)
- In computing: a program that works quietly in the background
- Convention: Often named with 'd' suffix (`httpd`, `sshd`, `mysqld`)

### Key Characteristics

1. **Background Process**: Runs invisibly, no visible window
2. **Long-Running**: Starts once, runs for days/weeks/months
3. **Automatic**: Can auto-start on system boot
4. **Service-Oriented**: Provides services to other programs
5. **Detached**: Not tied to a terminal session
6. **Logging**: Writes to log files (can't print to terminal)

### Real-World Analogy

Like a **security guard** or **librarian**:

- Works 24/7 in the background
- You don't interact directly
- Automatically responds when needed
- Provides a service without being asked each time

---

## Common Daemons in Development

### Database Servers

```bash
postgres         # PostgreSQL database
redis-server     # Redis cache
mongod           # MongoDB database
mysqld           # MySQL database
```

### Web Servers

```bash
nginx            # Web server / reverse proxy
httpd            # Apache HTTP server
```

### Message Queues & Streaming

```bash
rabbitmq-server  # Message broker
kafka            # Event streaming platform
```

### System Services

```bash
sshd             # SSH remote access
systemd-resolved # DNS resolver
cupsd            # Printing service
```

---

## Daemon vs Regular Program

| Aspect          | Regular Program           | Daemon                       |
| --------------- | ------------------------- | ---------------------------- |
| **Startup**     | Manual (you click/run)    | Automatic (system starts)    |
| **Visibility**  | Has window/interface      | Invisible background process |
| **Lifetime**    | Stops when closed         | Runs continuously            |
| **Interaction** | Direct user interaction   | Responds to other programs   |
| **Terminal**    | Can block terminal        | Detached from terminal       |
| **Examples**    | Chrome, VS Code, Terminal | PostgreSQL, Redis, Nginx     |

---

## How PostgreSQL Runs as a Daemon

### What Happens When You Start PostgreSQL

```bash
# Command you run
brew services start postgresql@18

# What it does:
1. Creates Launch Agent configuration file
2. Registers with macOS launchctl
3. Starts postgres daemon in background
4. Daemon listens on port 5432
5. Waits for database connections
6. Configures auto-start on login
```

### The Running Daemon Process

```bash
# View the daemon
ps aux | grep postgres

# Example output:
akhalinem  12345  0.0  0.1  postgres: background writer
akhalinem  12346  0.0  0.1  postgres: checkpointer
akhalinem  12347  0.0  0.1  postgres: walwriter
akhalinem  12348  0.0  0.1  postgres: autovacuum launcher
akhalinem  12349  0.0  0.1  postgres: logical replication launcher
```

Multiple processes! The main postgres daemon spawns helper processes.

---

## What is `brew services`?

`brew services` is a Homebrew extension that manages background services (daemons) on macOS.

### Purpose

- User-friendly wrapper around macOS's `launchctl`
- Simplifies daemon management
- Part of Homebrew ecosystem
- Makes service control intuitive

### The Problem It Solves

**Without brew services** (the hard way):

```bash
# Manual daemon management
launchctl load ~/Library/LaunchAgents/homebrew.mxcl.postgresql@18.plist
launchctl start homebrew.mxcl.postgresql@18
launchctl stop homebrew.mxcl.postgresql@18
launchctl unload ~/Library/LaunchAgents/homebrew.mxcl.postgresql@18.plist

# Or even harder (direct execution)
postgres -D /opt/homebrew/var/postgresql@18  # Blocks terminal!
```

**With brew services** (the easy way):

```bash
brew services start postgresql@18
brew services stop postgresql@18
brew services restart postgresql@18
brew services list
```

---

## brew services Commands

### Basic Commands

```bash
# List all services (running and stopped)
brew services list

# Start a service (auto-starts on login)
brew services start <service-name>

# Stop a service
brew services stop <service-name>

# Restart a service
brew services restart <service-name>

# Run service once (doesn't auto-start on login)
brew services run <service-name>

# Clean up unused services
brew services cleanup
```

### Real Examples

```bash
# Start databases
brew services start postgresql@18
brew services start redis
brew services start mongodb-community

# Stop when not needed
brew services stop postgresql@18

# Restart after config changes
brew services restart postgresql@18

# Check what's running
brew services list
```

---

## Understanding Service Status

```bash
$ brew services list
Name           Status     User      File
postgresql@18  started    akhalinem ~/Library/LaunchAgents/homebrew.mxcl.postgresql@18.plist
redis          stopped
nginx          none
```

### Status Meanings

| Status      | Meaning                                      |
| ----------- | -------------------------------------------- |
| **started** | Running now, will auto-start on login        |
| **stopped** | Not running, but configured (can be started) |
| **none**    | Not configured as a service                  |
| **error**   | Failed to start (check logs)                 |

---

## Behind the Scenes: How It Works

### When You Run `brew services start postgresql@18`

#### Step 1: Create Launch Agent

Creates a `.plist` file at:

```
~/Library/LaunchAgents/homebrew.mxcl.postgresql@18.plist
```

This XML file tells macOS how to run the daemon:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "...">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>homebrew.mxcl.postgresql@18</string>
  <key>ProgramArguments</key>
  <array>
    <string>/opt/homebrew/opt/postgresql@18/bin/postgres</string>
    <string>-D</string>
    <string>/opt/homebrew/var/postgresql@18</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
</dict>
</plist>
```

#### Step 2: Register with launchctl

```bash
launchctl load ~/Library/LaunchAgents/homebrew.mxcl.postgresql@18.plist
```

#### Step 3: Start the Service

```bash
launchctl start homebrew.mxcl.postgresql@18
```

#### Step 4: Monitor & Restart

- macOS monitors the daemon
- Automatically restarts if it crashes (KeepAlive: true)
- Starts automatically on login (RunAtLoad: true)

---

## macOS Service Management Locations

### User-Level Services (your daemons)

```bash
~/Library/LaunchAgents/
```

- Run when YOU log in
- Run as YOUR user
- Managed by you
- Example: Your PostgreSQL, Redis

### System-Level Services (system daemons)

```bash
/Library/LaunchDaemons/
```

- Run at system startup (before login)
- Run as root or specific user
- System-wide services
- Example: SSH, networking

---

## Practical Development Workflow

### Traditional Approach (Without Daemon)

```bash
# Every time you want to use PostgreSQL:
1. Open terminal
2. Run: postgres -D /opt/homebrew/var/postgresql@18
3. Terminal is blocked (can't use it)
4. If you close terminal, postgres stops
5. Your app can't connect if postgres isn't running
6. Repeat every day

❌ Annoying, error-prone
```

### Daemon Approach (With brew services)

```bash
# One-time setup:
brew services start postgresql@18

# Now:
✅ Postgres always running in background
✅ Terminal is free to use
✅ Auto-starts when you log in
✅ Your app can always connect
✅ Restarts automatically if crashes
✅ Never think about it again

# Only stop when you want to save resources:
brew services stop postgresql@18
```

---

## Viewing Running Daemons

### Using brew services

```bash
brew services list
```

### Using ps (process status)

```bash
# All processes
ps aux

# PostgreSQL daemon
ps aux | grep postgres

# Redis daemon
ps aux | grep redis

# See process tree
pstree  # (if installed: brew install pstree)
```

### Using lsof (list open files/ports)

```bash
# See what's listening on ports
lsof -i -P -n

# Check specific port
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :27017 # MongoDB
```

### Using Activity Monitor (GUI)

- Open Activity Monitor app
- Search for "postgres" or "redis"
- See CPU, memory usage

---

## Daemon Logging

Since daemons run in background, they write logs to files.

### PostgreSQL Logs

```bash
# Homebrew postgres logs
tail -f /opt/homebrew/var/log/postgresql@18.log

# Service management logs
tail -f ~/Library/Logs/Homebrew/postgresql@18/*.log

# Live monitoring
tail -f /opt/homebrew/var/log/postgresql@18.log
```

### Redis Logs

```bash
tail -f /opt/homebrew/var/log/redis.log
```

### System Logs (Console.app)

- Open Console.app
- Search for service name
- See all system logging

---

## When to Use Each Command

### Start (with auto-start on login)

```bash
brew services start postgresql@18
```

**Use for**: Development databases you use daily

### Run (one-time, no auto-start)

```bash
brew services run postgresql@18
```

**Use for**: Quick testing, don't want it always running

### Stop (disable service)

```bash
brew services stop postgresql@18
```

**Use for**: Save battery/resources when not developing

### Restart (fresh start)

```bash
brew services restart postgresql@18
```

**Use for**: After config changes, when something's stuck

---

## Common Services for Backend Development

### Databases

```bash
brew services start postgresql@18
brew services start redis
brew services start mongodb-community
brew services start mysql
```

### Web Servers

```bash
brew services start nginx
brew services start httpd  # Apache
```

### Message Queues

```bash
brew services start rabbitmq
brew services start kafka
```

### Search & Analytics

```bash
brew services start elasticsearch
```

---

## Troubleshooting Daemons

### Service Won't Start

```bash
# Check logs
tail -f ~/Library/Logs/Homebrew/postgresql@18/*.log

# Check if port is in use
lsof -i :5432

# Try manual start to see errors
postgres -D /opt/homebrew/var/postgresql@18

# Restart service
brew services restart postgresql@18
```

### Service Keeps Crashing

```bash
# Check data directory permissions
ls -la /opt/homebrew/var/postgresql@18

# Check configuration
cat /opt/homebrew/var/postgresql@18/postgresql.conf

# View detailed logs
tail -100 /opt/homebrew/var/log/postgresql@18.log
```

### Clean Up Old Services

```bash
# Remove services that aren't needed
brew services cleanup

# Uninstall and clean
brew services stop postgresql@18
brew uninstall postgresql@18
rm ~/Library/LaunchAgents/homebrew.mxcl.postgresql@18.plist
```

---

## Key Differences: brew services vs systemctl (Linux)

| Feature               | macOS (brew services)        | Linux (systemctl)         |
| --------------------- | ---------------------------- | ------------------------- |
| **List services**     | `brew services list`         | `systemctl list-units`    |
| **Start**             | `brew services start <name>` | `systemctl start <name>`  |
| **Stop**              | `brew services stop <name>`  | `systemctl stop <name>`   |
| **Enable auto-start** | Automatic with `start`       | `systemctl enable <name>` |
| **View logs**         | Log files                    | `journalctl -u <name>`    |
| **Config location**   | `~/Library/LaunchAgents/`    | `/etc/systemd/system/`    |

Similar concepts, different implementations!

---

## Best Practices

### Development Setup

1. **Start essential services**: Databases you use daily

   ```bash
   brew services start postgresql@18
   brew services start redis
   ```

2. **Stop when not needed**: Save battery on laptop

   ```bash
   brew services stop postgresql@18  # When done for the day
   ```

3. **Use `run` for experiments**: Testing new services

   ```bash
   brew services run mongodb-community  # One-time use
   ```

4. **Check regularly**: Know what's running
   ```bash
   brew services list
   ```

### Resource Management

```bash
# Check what's consuming resources
top  # or: htop (brew install htop)

# Stop unused services
brew services stop <unused-service>

# Clean up
brew services cleanup
```

---

## Summary

### Daemons

- **What**: Background processes that run continuously
- **Why**: Provide services without manual intervention
- **How**: Start once, run forever, auto-restart on crash
- **Examples**: PostgreSQL, Redis, Nginx

### brew services

- **What**: macOS service management tool for Homebrew
- **Why**: Simplifies daemon control (vs manual launchctl)
- **How**: Wraps launchctl with user-friendly commands
- **Benefit**: Easy start/stop/restart of background services

### For Your Development

- PostgreSQL runs as daemon via `brew services`
- Always available in background
- Auto-starts on login
- Can connect anytime from your Node.js apps
- Stop when not needed to save resources

---

## Key Learnings (November 5, 2025)

1. **Daemons are background workers**: Like having staff working 24/7 behind the scenes
2. **brew services simplifies management**: No need to learn launchctl complexity
3. **Services auto-restart**: macOS monitors and restarts crashed services
4. **Resource conscious**: Can stop services when not developing
5. **Logs are essential**: Since no terminal output, logs show what's happening
6. **Multiple processes normal**: Databases spawn helper processes for different tasks

---

## References

- macOS launchctl: `man launchctl`
- Launch Agent format: `man launchd.plist`
- Homebrew services: https://github.com/Homebrew/homebrew-services
- Process management: `man ps`, `man lsof`, `man pgrep`

---

_Understanding gained during PostgreSQL setup on November 5, 2025_  
_This knowledge applies to all background services in development_
