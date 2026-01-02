-- URL Shortener Database Schema
-- Run this file to set up your database

-- Create the urls table
CREATE TABLE IF NOT EXISTS urls (
  id SERIAL PRIMARY KEY,
  short_code VARCHAR(10) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  custom_alias BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  click_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_short_code ON urls(short_code);
CREATE INDEX IF NOT EXISTS idx_expires_at ON urls(expires_at) WHERE expires_at IS NOT NULL;

-- Display table structure
\d urls;

-- Confirm setup
SELECT 'Database setup complete!' AS status;
