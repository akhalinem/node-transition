# Exercise 1: Binary File Parser

**Difficulty**: ⭐⭐  
**Time**: 30-45 minutes

## Goal

Build a parser for a custom binary file format. This simulates reading configuration files, save games, or any proprietary binary format.

## File Format

You'll work with a simple binary database file:

```
┌─────────────────────────────────────────┐
│ Header (16 bytes)                       │
├───────────────────┬─────────────────────┤
│ Magic (4 bytes)   │ "MYDB"              │
│ Version (2 bytes) │ 1                   │
│ Record Count (4)  │ Number of records   │
│ Reserved (6)      │ Zeros               │
├─────────────────────────────────────────┤
│ Record 1 (64 bytes each)                │
│ Record 2                                │
│ ...                                     │
└─────────────────────────────────────────┘
```

Each record contains:

```
┌──────────┬─────┬──────────┬────────┬────────┐
│ ID       │ Age │ Name     │ Salary │ Active │
│ 4 bytes  │ 1 b │ 50 bytes │ 4 b    │ 1 b    │
│ uint32   │ u8  │ string   │ uint32 │ bool   │
└──────────┴─────┴──────────┴────────┴────────┘
```

## Tasks

### Part 1: Create File Generator

```javascript
// TODO: Implement generateDatabase()
function generateDatabase(filename, records) {
  // Create buffer for entire file
  // Write header:
  //   - Magic: "MYDB"
  //   - Version: 1
  //   - Record count
  //   - Reserved: 6 zero bytes
  // Write each record:
  //   - ID (4 bytes, big-endian)
  //   - Age (1 byte)
  //   - Name (50 bytes, null-terminated)
  //   - Salary (4 bytes, big-endian)
  //   - Active (1 byte, 0 or 1)
  // Write to file
}

// Example usage
generateDatabase("users.db", [
  { id: 1, age: 30, name: "Alice", salary: 75000, active: true },
  { id: 2, age: 25, name: "Bob", salary: 65000, active: false },
  { id: 3, age: 35, name: "Charlie", salary: 85000, active: true },
]);
```

### Part 2: Parse Header

```javascript
// TODO: Implement parseHeader()
function parseHeader(buffer) {
  // Read and validate magic number
  // Read version
  // Read record count
  // Return { magic, version, recordCount }
}
```

### Part 3: Parse Records

```javascript
// TODO: Implement parseRecord()
function parseRecord(buffer, offset) {
  // Read ID (4 bytes, big-endian)
  // Read age (1 byte)
  // Read name (50 bytes, trim nulls)
  // Read salary (4 bytes, big-endian)
  // Read active (1 byte, convert to boolean)
  // Return { id, age, name, salary, active }
}
```

### Part 4: Complete Parser

```javascript
// TODO: Implement parseDatabase()
function parseDatabase(filename) {
  // Read entire file
  // Parse header
  // Validate magic number
  // Parse all records
  // Return { header, records }
}
```

### Part 5: Query Functions

```javascript
// TODO: Implement query functions

function findById(filename, id) {
  // Find record with matching ID
}

function findByAge(filename, minAge, maxAge) {
  // Find all records in age range
}

function getActiveUsers(filename) {
  // Return all active users
}

function updateSalary(filename, id, newSalary) {
  // Update salary for given ID
  // Rewrite the file
}
```

## Expected Output

```
Generating database with 3 records...
✅ Created users.db (208 bytes)

Parsing database...
📋 Header:
   Magic: MYDB
   Version: 1
   Records: 3

👥 Records:
   [1] Alice, age 30, $75,000 (active)
   [2] Bob, age 25, $65,000 (inactive)
   [3] Charlie, age 35, $85,000 (active)

Queries:
   Find ID 2: Bob
   Age 25-32: Alice, Bob
   Active users: Alice, Charlie

Updated Bob's salary to $70,000
✅ Database updated
```

## Bonus Challenges

1. **Streaming Parser**: Read records one at a time (don't load entire file)
2. **Indexes**: Build an index file for fast lookups
3. **Compression**: Add optional compression flag
4. **Checksums**: Add CRC32 checksum for integrity
5. **Variable Records**: Support variable-length name fields
6. **Transactions**: Support atomic updates (write to temp, then rename)

## Testing

```bash
# Create and parse database
node exercise-1-solution.js

# Verify file size
ls -lh users.db
# Should be: 16 (header) + 64 * N (records)

# Hex dump to verify format
xxd users.db | head -20
```

## Hints

1. Use `Buffer.alloc()` for predictable sizes
2. Big-endian is network byte order (BE functions)
3. Null-terminate strings with `\0`
4. Use `Buffer.concat()` if building in parts
5. Validate magic number to detect file corruption

## Common Mistakes

- ❌ Using little-endian instead of big-endian
- ❌ Forgetting to null-terminate strings
- ❌ Not handling partial data when reading
- ❌ Modifying buffers that might be reused
- ❌ Not validating file format before parsing

## Success Criteria

- ✅ Generates valid binary file
- ✅ Parses header correctly
- ✅ Reads all records accurately
- ✅ Handles edge cases (empty name, etc.)
- ✅ Query functions work correctly
- ✅ Can update and rewrite file

## File Structure Diagram

```
Offset  | Size | Field        | Type
--------|------|--------------|--------
0       | 4    | Magic        | char[4]
4       | 2    | Version      | uint16
6       | 4    | Record Count | uint32
10      | 6    | Reserved     | zeros
16      | 4    | Record 1 ID  | uint32
20      | 1    | Record 1 Age | uint8
21      | 50   | Record 1 Name| char[50]
71      | 4    | Record 1 Sal | uint32
75      | 1    | Record 1 Act | uint8
80      | 4    | Record 2 ID  | uint32
...     | ...  | ...          | ...
```

Good luck! 🚀
