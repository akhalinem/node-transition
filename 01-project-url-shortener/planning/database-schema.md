# Database Schema Design

## URLs Table

```sql
CREATE TABLE urls (
  id SERIAL PRIMARY KEY,
  short_code VARCHAR(10) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  custom_alias BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  click_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_short_code ON urls(short_code);
CREATE INDEX idx_expires_at ON urls(expires_at) WHERE expires_at IS NOT NULL;
```

## Schema Explanation

### Fields:

- **id**: Auto-incrementing primary key
- **short_code**: The shortened URL code (e.g., "abc123")
- **original_url**: The full URL to redirect to
- **custom_alias**: Flag to track if user provided custom alias
- **created_at**: When the URL was created
- **expires_at**: Optional expiration date (NULL = never expires)
- **click_count**: Number of times the URL was accessed
- **last_accessed**: Last time someone used this short URL

### Indexes:

- **idx_short_code**: Fast lookups when redirecting
- **idx_expires_at**: Efficient cleanup of expired URLs

## Design Decisions:

1. **Why VARCHAR(10) for short_code?**

   - 10 characters gives us 62^10 = ~839 quadrillion combinations (using Base62)
   - More than enough for our use case

2. **Why UNIQUE on short_code?**

   - Prevents collision issues at database level
   - Ensures one code = one URL

3. **Why click_count in same table?**
   - Simple approach for MVP
   - For production, consider separate analytics table

## Future Improvements:

- Separate analytics table for detailed tracking
- User accounts table
- Audit log table
