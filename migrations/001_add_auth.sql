-- Migration: Add Authentication System
-- This migration creates the authentication tables and adds user_id to existing tables
-- Note: Robin's account will be created separately using a Node.js script after auth utilities are ready

-- ============================================================================
-- STEP 1: CREATE AUTH TABLES
-- ============================================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  last_login INTEGER,
  CONSTRAINT email_lowercase CHECK (email = LOWER(email))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at INTEGER NOT NULL,
  used INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_expires ON password_reset_tokens(expires_at);

-- ============================================================================
-- STEP 2: ADD user_id COLUMNS TO EXISTING TABLES
-- ============================================================================

-- Add user_id to tasks table
ALTER TABLE tasks ADD COLUMN user_id INTEGER;

-- Add user_id to relationships table
ALTER TABLE relationships ADD COLUMN user_id INTEGER;

-- Add user_id to accomplishments table
ALTER TABLE accomplishments ADD COLUMN user_id INTEGER;

-- Add user_id to weekly_logs table
ALTER TABLE weekly_logs ADD COLUMN user_id INTEGER;

-- ============================================================================
-- STEP 3: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_relationships_user_id ON relationships(user_id);
CREATE INDEX IF NOT EXISTS idx_accomplishments_user_id ON accomplishments(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_logs_user_id ON weekly_logs(user_id);

-- ============================================================================
-- STEP 4: CREATE ROBIN'S ACCOUNT AND LINK EXISTING DATA
-- ============================================================================
-- Robin's account with email rbndchsn@gmail.com / password Robind_001
-- Generated using PBKDF2 (100,000 iterations, SHA-256)

-- Insert Robin's account
INSERT INTO users (name, email, password_hash, salt, created_at)
VALUES ('Robin', 'rbndchsn@gmail.com', '54e1c85b6abd7de12ddc825c6bdea5617281cdfc3c4a0b724b99103ec741d704', 'ac330e663f6e4990f796c61d4639c6908d5c2089b19d77eb2debf90c6f5429d8', 1767827649);

-- Link all existing data to Robin's account
UPDATE tasks SET user_id = (SELECT id FROM users WHERE email = 'rbndchsn@gmail.com');
UPDATE relationships SET user_id = (SELECT id FROM users WHERE email = 'rbndchsn@gmail.com');
UPDATE accomplishments SET user_id = (SELECT id FROM users WHERE email = 'rbndchsn@gmail.com');
UPDATE weekly_logs SET user_id = (SELECT id FROM users WHERE email = 'rbndchsn@gmail.com');
