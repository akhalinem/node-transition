# Database Indexing Guide

**Purpose**: Comprehensive guide to understanding database indexes, how they work, and the indexing strategy for this chat platform.

---

## 📚 Table of Contents

1. [What is an Index?](#what-is-an-index)
2. [How Indexes Work (Mental Model)](#how-indexes-work-mental-model)
3. [When PostgreSQL Auto-Creates Indexes](#when-postgresql-auto-creates-indexes)
4. [Types of Indexes](#types-of-indexes)
5. [Composite Indexes Deep Dive](#composite-indexes-deep-dive)
6. [Index Strategy for This Project](#index-strategy-for-this-project)
7. [Common Pitfalls](#common-pitfalls)
8. [Testing Index Effectiveness](#testing-index-effectiveness)
9. [Index Maintenance](#index-maintenance)

---

## What is an Index?

### The Book Analogy

Imagine a 1000-page book without an index:

- **Finding a topic**: Read every page until you find it (slow!)
- **With an index**: Jump directly to page 347 (fast!)

A database index works the same way:

- **Without index**: Scan every row in the table (**Sequential Scan**)
- **With index**: Jump directly to matching rows (**Index Scan**)

### Real Example

**Without index**:

```sql
-- Find messages in a room (no index)
SELECT * FROM room_messages WHERE room_id = 'lobby-uuid';

-- PostgreSQL must:
-- 1. Read ALL rows (1 million messages)
-- 2. Check each row: "Is room_id = 'lobby-uuid'?"
-- 3. Return matches
-- Time: ~500ms for 1 million rows
```

**With index**:

```sql
-- Find messages in a room (with index on room_id)
SELECT * FROM room_messages WHERE room_id = 'lobby-uuid';

-- PostgreSQL:
-- 1. Looks up 'lobby-uuid' in index (fast tree lookup)
-- 2. Gets row locations directly
-- 3. Reads only matching rows
-- Time: ~5ms (100x faster!)
```

---

## How Indexes Work (Mental Model)

### B-Tree Index Structure (PostgreSQL Default)

Think of it like a **sorted phonebook with multiple levels**:

```
Level 1 (Root):        [A-M] [N-Z]
                         ↓      ↓
Level 2 (Branches): [A-F][G-M] [N-S][T-Z]
                      ↓    ↓     ↓     ↓
Level 3 (Leaves):   [A][B] [G][H] [N][O] [T][U]
                     ↓  ↓   ↓  ↓   ↓  ↓   ↓  ↓
Data Pages:        rows rows rows rows ...
```

**Search process** for `WHERE username = 'alice'`:

1. Start at root: "alice" starts with 'a', go left to [A-M]
2. Go to branch: [A-F], go left
3. Go to leaf: [A], found!
4. Jump to data page

**Complexity**: O(log n) - very fast even with millions of rows

---

## When PostgreSQL Auto-Creates Indexes

### ✅ Automatic Indexes

PostgreSQL **automatically creates indexes** for:

1. **PRIMARY KEY** constraints

   ```sql
   CREATE TABLE users (
     id UUID PRIMARY KEY  -- Auto-creates index on 'id'
   );
   ```

2. **UNIQUE** constraints
   ```sql
   CREATE TABLE users (
     email VARCHAR(255) UNIQUE  -- Auto-creates index on 'email'
   );
   ```

**Why?**: These constraints require fast lookups to enforce uniqueness.

### ❌ NO Automatic Indexes

PostgreSQL **does NOT** auto-create indexes for:

1. **FOREIGN KEY** constraints

   ```sql
   CREATE TABLE room_messages (
     room_id UUID REFERENCES rooms(id)  -- NO auto-index!
   );
   ```

   **You must manually create**: `CREATE INDEX idx_room_messages_room_id ON room_messages(room_id);`

2. **Regular columns**
   ```sql
   CREATE TABLE users (
     created_at TIMESTAMPTZ  -- NO auto-index!
   );
   ```

**Why foreign keys aren't auto-indexed**:

- Not all foreign keys need indexes (depends on query patterns)
- Parent table's PRIMARY KEY is already indexed (that's what matters for referential integrity)
- Child table may or may not query by FK (you decide based on your queries)

---

## Types of Indexes

### 1. Single-Column Index

**Structure**: Index on one column

```sql
CREATE INDEX idx_users_email ON users(email);
```

**Use case**: Queries filtering by that single column

```sql
SELECT * FROM users WHERE email = 'alice@example.com';
```

**When to use**:

- ✅ Column is frequently used in `WHERE` clauses
- ✅ Column has high cardinality (many unique values)
- ❌ Don't use for low-cardinality columns (e.g., boolean with only TRUE/FALSE)

---

### 2. Composite Index (Multi-Column)

**Structure**: Index on multiple columns **in specific order**

```sql
CREATE INDEX idx_room_messages_room_created
ON room_messages(room_id, created_at DESC);
```

**Use case**: Queries filtering and/or sorting by multiple columns

```sql
SELECT * FROM room_messages
WHERE room_id = 'lobby-uuid'
ORDER BY created_at DESC
LIMIT 50;
```

**Key Rule**: **Left-to-right prefix matching**

A composite index on `(A, B, C)` can be used for:

- ✅ `WHERE A = ?`
- ✅ `WHERE A = ? AND B = ?`
- ✅ `WHERE A = ? AND B = ? AND C = ?`
- ✅ `WHERE A = ? ORDER BY B`
- ❌ `WHERE B = ?` (B is not the first column)
- ❌ `WHERE C = ?` (C is not the first column)
- ❌ `WHERE B = ? AND C = ?` (doesn't start with A)

**When to use**:

- ✅ Frequent queries use multiple columns together
- ✅ Want to optimize both filtering AND sorting
- ✅ Want to avoid multiple separate indexes

---

### 3. Partial Index

**Structure**: Index only a **subset of rows** based on a condition

```sql
CREATE INDEX idx_dm_unread
ON direct_messages(recipient_id, created_at DESC)
WHERE read = FALSE;
```

**Use case**: Queries that always include the same filter

```sql
-- Optimized by partial index
SELECT * FROM direct_messages
WHERE recipient_id = 'user-uuid'
  AND read = FALSE
ORDER BY created_at DESC;
```

**Benefits**:

- ✅ Smaller index (only indexes unread messages)
- ✅ Faster index scans
- ✅ Less storage
- ✅ Faster writes (fewer rows to index)

**When to use**:

- ✅ You frequently query a small subset of rows
- ✅ The filter condition is consistent (e.g., `WHERE active = TRUE`, `WHERE deleted_at IS NULL`)
- ❌ Don't use if the condition varies

---

### 4. Unique Index

**Structure**: Index that enforces uniqueness

```sql
CREATE UNIQUE INDEX idx_users_email ON users(email);
```

**Use case**: Same as `UNIQUE` constraint (they're equivalent)

**Note**: You rarely need to create these manually - use `UNIQUE` constraint instead, which auto-creates the index.

---

## Composite Indexes Deep Dive

### Why Order Matters

Given index: `CREATE INDEX idx_messages ON messages(room_id, created_at DESC);`

**Think of it as a phone book sorted by (LastName, FirstName)**:

```
Index entries (sorted):
room_id='lobby'    created_at='2026-01-05 14:00:00'  → Row 500
room_id='lobby'    created_at='2026-01-05 13:59:00'  → Row 499
room_id='lobby'    created_at='2026-01-05 13:58:00'  → Row 498
room_id='general'  created_at='2026-01-05 14:05:00'  → Row 302
room_id='general'  created_at='2026-01-05 14:04:00'  → Row 301
```

**Query 1**: `WHERE room_id = 'lobby'`

- ✅ Index helps! Jump to all 'lobby' entries
- Like finding all people with last name "Smith"

**Query 2**: `WHERE room_id = 'lobby' ORDER BY created_at DESC`

- ✅ Index helps! Data already sorted by created_at within 'lobby'
- Like finding all "Smiths" and they're already sorted by first name

**Query 3**: `WHERE created_at > '2026-01-05 14:00:00'`

- ❌ Index doesn't help! created_at is not the first column
- Like trying to find everyone born in 1990 - you'd need to scan the whole phone book

---

### Composite Index Example from This Project

```sql
CREATE INDEX idx_room_messages_room_created
ON room_messages(room_id, created_at DESC);
```

**Optimized queries**:

1. **Get messages in a room**:

   ```sql
   SELECT * FROM room_messages WHERE room_id = ?;
   -- Uses index: Finds all rows with matching room_id
   ```

2. **Paginate messages (most common query)**:

   ```sql
   SELECT * FROM room_messages
   WHERE room_id = ?
   ORDER BY created_at DESC
   LIMIT 50;
   -- Perfect! Index provides filtering AND sorting
   -- No separate sort step needed
   ```

3. **Pagination with offset**:
   ```sql
   SELECT * FROM room_messages
   WHERE room_id = ?
   ORDER BY created_at DESC
   LIMIT 50 OFFSET 100;
   -- Still uses index efficiently
   ```

**Not optimized by this index**:

```sql
-- This doesn't use the index (created_at is second column)
SELECT * FROM room_messages
WHERE created_at > '2026-01-05 14:00:00';
```

---

### When to Use Multiple Separate Indexes vs. One Composite

**Scenario**: Queries on `room_id` AND queries on `created_at`

**Option A**: Two separate indexes

```sql
CREATE INDEX idx_room_id ON room_messages(room_id);
CREATE INDEX idx_created_at ON room_messages(created_at);
```

**Option B**: One composite index

```sql
CREATE INDEX idx_room_created ON room_messages(room_id, created_at DESC);
```

**Decision matrix**:

| Query Pattern                                             | Use Option A | Use Option B  |
| --------------------------------------------------------- | ------------ | ------------- |
| Always filters by `room_id`                               | ❌           | ✅            |
| Sometimes filters by `room_id`, sometimes by `created_at` | ✅           | ❌            |
| Filters by `room_id` AND sorts by `created_at`            | ❌           | ✅ (perfect!) |
| Filters by both columns together                          | ❌           | ✅            |

**For this chat app**: Option B (composite) is best because you **always** query messages by room and sort by time.

---

## Index Strategy for This Project

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,                    -- Auto-indexed
  email VARCHAR(255) UNIQUE NOT NULL,     -- Auto-indexed
  username VARCHAR(50) UNIQUE NOT NULL,   -- Auto-indexed
  ...
);
```

**No additional indexes needed!**

**Why?**

- `id` is PRIMARY KEY → auto-indexed
- `email` is UNIQUE → auto-indexed
- `username` is UNIQUE → auto-indexed
- These are your only query patterns (login by email/username, lookup by id)

---

### Rooms Table

```sql
CREATE TABLE rooms (
  id UUID PRIMARY KEY,              -- Auto-indexed
  created_by UUID REFERENCES users(id),
  ...
);

CREATE INDEX idx_rooms_created_by ON rooms(created_by);
```

**Why `idx_rooms_created_by`?**

**Query pattern**: "Get all rooms created by this user"

```sql
SELECT * FROM rooms WHERE created_by = 'user-uuid';
```

**Foreign key** on `created_by` is **not auto-indexed**, so we create it manually.

**Frequency**: Medium (when showing "My Rooms" page)

---

### Room Messages Table (CRITICAL)

```sql
CREATE TABLE room_messages (
  id UUID PRIMARY KEY,              -- Auto-indexed
  room_id UUID NOT NULL REFERENCES rooms(id),
  user_id UUID NOT NULL REFERENCES users(id),
  ...
);

CREATE INDEX idx_room_messages_room_created
ON room_messages(room_id, created_at DESC);
```

**Why this composite index?**

**Primary query** (happens on EVERY page load):

```sql
SELECT * FROM room_messages
WHERE room_id = ?
ORDER BY created_at DESC
LIMIT 50;
```

**Without index**:

1. Scan all 10 million messages
2. Filter by room_id
3. Sort by created_at
4. Take first 50
   → **SLOW** (seconds)

**With composite index**:

1. Jump to room's messages (already sorted)
2. Read first 50
   → **FAST** (<10ms)

**Why NOT separate indexes?**

You might think: "Let's create two indexes"

```sql
CREATE INDEX idx_room_id ON room_messages(room_id);        -- Don't do this!
CREATE INDEX idx_created_at ON room_messages(created_at);  -- Don't do this!
```

**Problem**:

- PostgreSQL can only use ONE index per table per query (usually)
- If it uses `idx_room_id`, it still needs to sort by created_at (expensive!)
- If it uses `idx_created_at`, it still needs to filter by room_id (expensive!)

**Solution**: Composite index does BOTH in one index!

---

### Room Members Table

```sql
CREATE TABLE room_members (
  room_id UUID REFERENCES rooms(id),
  user_id UUID REFERENCES users(id),
  PRIMARY KEY (room_id, user_id)  -- Composite PK creates index on (room_id, user_id)
);

CREATE INDEX idx_room_members_user_id ON room_members(user_id);
```

**Why we need BOTH indexes**:

**Query 1**: "Get all members in a room"

```sql
SELECT user_id FROM room_members WHERE room_id = ?;
```

✅ Uses PRIMARY KEY index (room_id is first column)

**Query 2**: "Get all rooms this user is in" (happens on EVERY WebSocket connection)

```sql
SELECT room_id FROM room_members WHERE user_id = ?;
```

❌ PRIMARY KEY index can't help (user_id is second column)
✅ Uses `idx_room_members_user_id`

**This is a common pattern**: When you have bidirectional relationships, you need indexes both ways.

---

### Direct Messages Table

```sql
CREATE TABLE direct_messages (
  id UUID PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES users(id),
  recipient_id UUID NOT NULL REFERENCES users(id),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ...
);

-- Index for "messages I sent"
CREATE INDEX idx_dm_sender ON direct_messages(sender_id);

-- Index for "messages I received" (inbox)
CREATE INDEX idx_dm_recipient ON direct_messages(recipient_id);

-- Index for conversation view (one direction)
CREATE INDEX idx_dm_conversation
ON direct_messages(sender_id, recipient_id, created_at DESC);

-- Partial index for unread messages
CREATE INDEX idx_dm_unread
ON direct_messages(recipient_id, created_at DESC)
WHERE read = FALSE;
```

**Why 4 indexes?**

**Query 1**: "Show my inbox" (messages I received)

```sql
SELECT * FROM direct_messages
WHERE recipient_id = 'me'
ORDER BY created_at DESC;
```

✅ Uses `idx_dm_recipient`

**Query 2**: "Show conversation with Alice" (bidirectional!)

```sql
SELECT * FROM direct_messages
WHERE (sender_id = 'me' AND recipient_id = 'alice')
   OR (sender_id = 'alice' AND recipient_id = 'me')
ORDER BY created_at DESC;
```

**Problem**: This OR clause can't use a single index efficiently!

**Solution A** (current approach): Query twice and merge in application

```sql
-- Query 1: Messages I sent to Alice
SELECT * FROM direct_messages
WHERE sender_id = 'me' AND recipient_id = 'alice';

-- Query 2: Messages Alice sent to me
SELECT * FROM direct_messages
WHERE sender_id = 'alice' AND recipient_id = 'me';

-- Merge results in Node.js and sort
```

✅ Both queries use `idx_dm_conversation` efficiently

**Solution B** (advanced): Create conversations table (covered in schema design docs)

**Query 3**: "Show unread message count" (badge in UI)

```sql
SELECT COUNT(*) FROM direct_messages
WHERE recipient_id = 'me' AND read = FALSE;
```

✅ Uses `idx_dm_unread` (partial index)

**Why partial index is better**:

```sql
-- Without partial index: Index size = 1 million rows
CREATE INDEX idx_dm_all ON direct_messages(recipient_id, created_at DESC);

-- With partial index: Index size = 50,000 rows (only unread)
CREATE INDEX idx_dm_unread
ON direct_messages(recipient_id, created_at DESC)
WHERE read = FALSE;
```

- Smaller index = faster scans
- Faster writes (only index unread messages)
- Perfect for this query pattern (you ALWAYS filter by `read = FALSE`)

---

## Common Pitfalls

### 1. Over-Indexing

**Mistake**: "More indexes = faster queries, right?"

```sql
-- DON'T DO THIS
CREATE INDEX idx_user_id ON room_messages(user_id);
CREATE INDEX idx_room_id ON room_messages(room_id);
CREATE INDEX idx_created_at ON room_messages(created_at);
CREATE INDEX idx_message_type ON room_messages(message_type);
CREATE INDEX idx_room_created ON room_messages(room_id, created_at);
-- 5 indexes on one table!
```

**Problems**:

- ❌ Every INSERT/UPDATE/DELETE must update ALL indexes (slower writes)
- ❌ More storage (indexes take space)
- ❌ PostgreSQL might choose wrong index (query planner confusion)

**Solution**: Only index columns you **actually query**

---

### 2. Indexing Low-Cardinality Columns

**Mistake**: Index columns with few unique values

```sql
-- DON'T DO THIS (usually)
CREATE INDEX idx_is_private ON rooms(is_private);  -- Only TRUE/FALSE
```

**Problem**: Not selective enough

- If 50% of rooms are private, the index doesn't help much
- PostgreSQL might do a full table scan anyway

**Exception**: Use **partial index** if you mostly query one value

```sql
-- BETTER: Only index public rooms
CREATE INDEX idx_public_rooms ON rooms(created_at DESC)
WHERE is_private = FALSE;
```

---

### 3. Wrong Column Order in Composite Index

**Mistake**: Putting less-selective column first

```sql
-- BAD: created_at first (all rows have unique timestamps)
CREATE INDEX idx_bad ON room_messages(created_at, room_id);

-- GOOD: room_id first (filters to specific room)
CREATE INDEX idx_good ON room_messages(room_id, created_at DESC);
```

**Rule**: Put columns in order of:

1. **Filtering columns** (WHERE clause) first
2. **Most selective** (fewer matches) columns first
3. **Sorting columns** (ORDER BY) last

---

### 4. Forgetting to Index Foreign Keys

**Mistake**: Assuming foreign keys are auto-indexed

```sql
-- This does NOT create an index on room_id!
room_id UUID REFERENCES rooms(id)
```

**You must explicitly create**:

```sql
CREATE INDEX idx_room_id ON room_messages(room_id);
```

---

### 5. Not Using DESC for Time-Based Sorting

**Mistake**: Index doesn't match query sort order

```sql
-- Query always sorts newest first
SELECT * FROM room_messages
WHERE room_id = ?
ORDER BY created_at DESC;  -- DESC!

-- But index is ascending
CREATE INDEX idx_wrong ON room_messages(room_id, created_at);  -- Missing DESC

-- Should be:
CREATE INDEX idx_right ON room_messages(room_id, created_at DESC);
```

**Impact**: PostgreSQL might need to reverse-scan the index (slower)

---

## Testing Index Effectiveness

### EXPLAIN ANALYZE: Your Best Friend

```sql
EXPLAIN ANALYZE
SELECT * FROM room_messages
WHERE room_id = 'lobby-uuid'
ORDER BY created_at DESC
LIMIT 50;
```

**Output to look for**:

**✅ Good (uses index)**:

```
Index Scan using idx_room_messages_room_created on room_messages
  Index Cond: (room_id = 'lobby-uuid')
  Rows: 50
  Actual time: 0.123..0.456 rows=50
```

**❌ Bad (sequential scan)**:

```
Seq Scan on room_messages
  Filter: (room_id = 'lobby-uuid')
  Rows Removed by Filter: 999950
  Actual time: 234.567..456.789 rows=50
```

**Key differences**:

- `Index Scan` vs `Seq Scan`
- Low time (<1ms) vs high time (>100ms)
- Few rows scanned vs many rows removed by filter

---

### When to Use EXPLAIN ANALYZE

**During development** (Week 3-4):

- Test all major queries with `EXPLAIN ANALYZE`
- Verify indexes are being used

**During load testing** (Week 5):

- Find slow queries in logs
- Run `EXPLAIN ANALYZE` on them
- Add indexes if needed

**Example workflow**:

```sql
-- 1. Test query
EXPLAIN ANALYZE
SELECT * FROM room_messages WHERE room_id = ? ORDER BY created_at DESC LIMIT 50;

-- If it shows "Seq Scan":
-- 2. Add index
CREATE INDEX idx_room_messages_room_created ON room_messages(room_id, created_at DESC);

-- 3. Re-test
EXPLAIN ANALYZE
SELECT * FROM room_messages WHERE room_id = ? ORDER BY created_at DESC LIMIT 50;

-- Should now show "Index Scan"
```

---

## Index Maintenance

### Indexes Update Automatically

**Good news**: PostgreSQL maintains indexes automatically!

When you:

- `INSERT` a row → Index updated
- `UPDATE` a row → Index updated
- `DELETE` a row → Index removed from index

**You don't need to do anything.**

---

### When to REINDEX

Over time, indexes can become **bloated** (fragmented):

```sql
-- Check index size
SELECT pg_size_pretty(pg_relation_size('idx_room_messages_room_created'));

-- Rebuild index if bloated
REINDEX INDEX idx_room_messages_room_created;
```

**When to reindex**:

- ✅ After bulk deletes (millions of rows)
- ✅ After major data changes
- ✅ If queries slow down over time
- ❌ Not needed for normal operation

---

### Monitoring Index Usage

**See which indexes are actually used**:

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,           -- Times index was scanned
  idx_tup_read,       -- Rows read from index
  idx_tup_fetch       -- Rows fetched from table
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

**If `idx_scan = 0`**: Index is never used → consider removing it!

---

## Quick Reference: Index Decision Tree

```
┌─────────────────────────────────────┐
│ Do I need an index on this column?  │
└─────────────────┬───────────────────┘
                  │
        ┌─────────▼──────────┐
        │ Is it used in      │
        │ WHERE or JOIN?     │
        └─────────┬──────────┘
                  │
            Yes   │   No → Don't index
                  │
        ┌─────────▼──────────┐
        │ Is it high         │
        │ cardinality?       │
        │ (many unique vals) │
        └─────────┬──────────┘
                  │
            Yes   │   No → Partial index or skip
                  │
        ┌─────────▼──────────┐
        │ Is it queried with │
        │ other columns?     │
        └─────────┬──────────┘
                  │
            Yes   │   No → Single-column index
                  │
        ┌─────────▼──────────┐
        │ Always queried     │
        │ together?          │
        └─────────┬──────────┘
                  │
            Yes   │   No → Separate indexes
                  │
        ┌─────────▼──────────┐
        │ Does query also    │
        │ ORDER BY?          │
        └─────────┬──────────┘
                  │
            Yes   │   No → Composite index on filter columns
                  │
        ┌─────────▼──────────┐
        │ Create composite   │
        │ index with ORDER   │
        │ BY column last     │
        │ (with DESC if      │
        │ needed)            │
        └────────────────────┘
```

---

## Summary: Indexes for This Chat Platform

| Table             | Index                            | Purpose                         | Query Pattern           |
| ----------------- | -------------------------------- | ------------------------------- | ----------------------- |
| `users`           | _(none)_                         | UNIQUE constraints auto-indexed | Login by email/username |
| `rooms`           | `idx_rooms_created_by`           | Find rooms by creator           | "My Rooms" page         |
| `room_messages`   | `idx_room_messages_room_created` | Paginate chat history           | Load messages in room   |
| `room_members`    | `idx_room_members_user_id`       | Find user's rooms               | WebSocket connection    |
| `direct_messages` | `idx_dm_sender`                  | Messages I sent                 | Sent messages view      |
| `direct_messages` | `idx_dm_recipient`               | Messages I received             | Inbox view              |
| `direct_messages` | `idx_dm_conversation`            | Conversation history            | Chat with specific user |
| `direct_messages` | `idx_dm_unread` (partial)        | Unread count                    | Inbox badge             |

**Total indexes**: 7 (excluding auto-created PRIMARY KEY and UNIQUE indexes)

---

## Learning Checklist

After reading this guide, you should be able to answer:

- [x] What's the difference between a sequential scan and an index scan?
- [x] When does PostgreSQL automatically create indexes?
- [x] Why don't foreign keys get auto-indexed?
- [x] What is a composite index and when should I use one?
- [x] Why does column order matter in composite indexes?
- [x] What is a partial index and when is it useful?
- [x] How do I test if my index is being used?
- [x] What are the downsides of creating too many indexes?
- [x] When should I index a foreign key?
- [x] How do I know if I should use one composite index vs. multiple single-column indexes?

**Want to test yourself?** Try explaining each concept to someone else (or write it down). If you can explain it simply, you understand it!

---

## Additional Resources

- [PostgreSQL Index Documentation](https://www.postgresql.org/docs/current/indexes.html)
- [Use The Index, Luke!](https://use-the-index-luke.com/) - Excellent free book on database indexing
- [PostgreSQL Wiki: Index Maintenance](https://wiki.postgresql.org/wiki/Index_Maintenance)
- [Explain Depesz](https://explain.depesz.com/) - Visualize EXPLAIN ANALYZE output

**Pro tip**: During Week 5 load testing, use `EXPLAIN ANALYZE` on every slow query you find. This is how you'll build intuition for when indexes help!
