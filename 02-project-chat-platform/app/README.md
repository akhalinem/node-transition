# Database Setup Guide

## Prerequisites

- PostgreSQL installed via Homebrew
- PostgreSQL service running

## Setup Steps

### 1. Start PostgreSQL

```bash
brew services start postgresql
```

Verify it's running:

```bash
pg_isready
```

### 2. Create the Database

```bash
createdb -U postgres chatapp
```

### 3. Run Migrations

```bash
psql -U postgres -d chatapp < src/database/migrations/001_initial_schema.sql
```

### 4. Verify

```bash
psql -U postgres -d chatapp -c "\dt"
```

You should see 6 tables: `users`, `rooms`, `messages`, `room_members`, `direct_messages`.

## Troubleshooting

### "role 'postgres' does not exist"

Create the postgres user:

```bash
createuser -s postgres
```

Then proceed with the setup steps above.

## Connection Details

- **Host:** localhost
- **Port:** 5432
- **Database:** chatapp
- **User:** postgres
