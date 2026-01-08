-- Migration: Add Progress Tracking
-- Adds current_day column to track user's actual progress through the 30-day program

ALTER TABLE users ADD COLUMN current_day INTEGER DEFAULT 1;

-- Update existing Robin's account to start at Day 1
UPDATE users SET current_day = 1 WHERE email = 'rbndchsn@gmail.com';
