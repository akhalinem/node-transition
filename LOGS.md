# Learning Logs

Chronological timeline of my backend engineering journey.

---

## November 2025

### Tuesday, November 5

**14:00** - Started repository organization

**14:30** - Installed PostgreSQL 18.0

- Native ARM64 build
- Auto-starts via brew services

**15:00** - Session ended (1 hour)

Key learning: Daemons are background processes that run continuously

---

### Wednesday, November 6

**10:00** - Installed Redis 8.2.3

- Lightweight (10MB vs 100MB for Postgres)
- Port 6379
- Testing: PING → PONG ✅

**10:30** - Session ended (30 min)

---

### Friday, November 7

**02:30** - Reading the visual guide on 00-fundamentals
**02:34** - Wanted to log file extension, but copilot says it's mainly used for machine-generated system-logs and we should better stick to the markdown format
**02:38** - hidden classes concept used for machine code optimization looks interesting, but I'm not really sure it'd even be useful to know this info for backend development
**02:41** - it says the order of properties matters when defining objects in javascript, interesting
**02:43** - I'm still not confident in threads, thread pools. I really want to learn threads and parallelism overall better. Hopefully, I'll get better using this guide.
**02:45** - finished reading the visual guide
**02:46** - started reading the readme in 01 module
**02:56** - finished the readme of 01 module
**02:57** - there was a reference to something called libuv, read its docs, looks too low-level for me.

### Saturday, November 8

**00:41** - started reading event-loop-phases.js file. I'm looking at the code, but feels like I should study the theory first.
**00:42** - Checked the main readme for the module and found a reading - https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick, reading it now.
**23:50** - the doc was not enough, I had to read some external resources to get a better idea of these phases
**23:53** - I was able to predict the order of execution correctly in the first try without looking at the answer in event-loop-phases.js

### Sunday, November 9

**00:20** - I chatter with claude and got some better idea on micro tasks
**00:20** - Finished the microtasks-vs-macrotasks.js, was able to predict the order of execution in the first try
**00:20** - started timin-comparison.js
**01:46** - didn't quite get the different of recursive calls of nextTick and setImmediate
**01:53** - I see the difference now, nextTick runs between phases, so it makes up an infinitely long queue of micro-tasks. setImmediate on the other hand schedules yet another callback for the next iteration
**03:05** - finished the timing-comparison.js
**03:05** - reading the event-loop-blocking.js
**04:08** - setImmediate looks cool
**04:09** - I wonder why I have never seen it before
**14:15** - I'm now thinking that react core team probably implemented concurrent features using setImmediate API or something. Does browser runtime have setImmediate API or similar thing or it's unique to node runtime?
**14:30** - doing the exercise-1-event-loop.js
**14:30** - I almost predicted the order of execution, but I thought the timeout callbacks would execute its queue fully and then microtasks would execute before stepping out of the timer phase. But the actual execution was a bit different, after each timeout callback execution, the microtasks queue inserted and all the microtasks got executed before the next timer callback.
**14:36** - Turns out microtasks get executed between each callback in every phase, not between phases
**14:41** - created another exercise on event loop
**14:41** - let's give this one a try and see how good I learnt the concept
**16:44** - it was tough and I made mistakes again, but I think I got the idea now. timer, i/o, check phases all process macrotasks. Between each macrotask, we empty microtasks queue. Microtasks start with nextTick queue, then promises queue. After that, if there microtask is still not empty, we go through the queues again. Once the microtask queues are empty, we go to the next phase (step). When processsing promise queue, we don't switch to other thing until we empty the promise queue, that's important.
**16:45** - Also, I/O calls finish time is non-deterministic, we can't really predict the ordering with I/O callbacks.
**18:13** - All good now
**18:30** - with that, the event-loop module is done
**18:34** - starting the 02-v8-engine module
### Tuesday, November 11

**00:43** - finished v8-engine
### Thursday, November 13

**01:02** - read some more external sources on v8
**01:02** - doing the exercise-3-v8-optimization.js now
**01:03** - weird, the inconsistentObjects taking less time than the consistent one. Maybe nodejs did some improvements in later versions?
**01:09** - these details look too much, especially after seeing the opposite in action
**01:09** - skimming the exercise
**01:10** - reading the next - threadpool-demo.js
**01:47** - read some more external sources
**01:48** - libuv's thread pool makes sense now
**01:50** - doing the thread pool exercise now
**01:56** - skimmed, skipping it
**02:06** - wrapping up the 01-runtime-architechure module
