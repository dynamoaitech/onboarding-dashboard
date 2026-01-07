/**
 * Script to generate Robin's account credentials for the database migration
 *
 * This script generates the salt and password hash for Robin's account using
 * the same PBKDF2 algorithm (100,000 iterations, SHA-256) as the auth system.
 *
 * Run this script with Node.js to generate the SQL INSERT statement:
 * node init-robin-account.js
 */

import crypto from 'crypto';

// Helper functions matching the auth utilities
function bufferToHex(buffer) {
  return Array.from(buffer)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

function generateSalt() {
  const salt = crypto.randomBytes(32);
  return bufferToHex(salt);
}

function hashPassword(password, saltHex) {
  const salt = hexToBuffer(saltHex);
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  return bufferToHex(hash);
}

// Robin's credentials
const ROBIN_NAME = 'Robin';
const ROBIN_EMAIL = 'rbndchsn@gmail.com';
const ROBIN_PASSWORD = 'Robind_001';

// Generate salt and hash
const salt = generateSalt();
const passwordHash = hashPassword(ROBIN_PASSWORD, salt);
const timestamp = Math.floor(Date.now() / 1000);

console.log('='.repeat(80));
console.log('Robin\'s Account Initialization');
console.log('='.repeat(80));
console.log('');
console.log('Credentials:');
console.log(`  Name: ${ROBIN_NAME}`);
console.log(`  Email: ${ROBIN_EMAIL}`);
console.log(`  Password: ${ROBIN_PASSWORD}`);
console.log('');
console.log('Generated values:');
console.log(`  Salt: ${salt}`);
console.log(`  Hash: ${passwordHash}`);
console.log(`  Timestamp: ${timestamp}`);
console.log('');
console.log('='.repeat(80));
console.log('SQL to add to migration (001_add_auth.sql):');
console.log('='.repeat(80));
console.log('');
console.log('-- Insert Robin\'s account (after creating users table)');
console.log(`INSERT INTO users (name, email, password_hash, salt, created_at)`);
console.log(`VALUES ('${ROBIN_NAME}', '${ROBIN_EMAIL}', '${passwordHash}', '${salt}', ${timestamp});`);
console.log('');
console.log('-- Link all existing data to Robin\'s account');
console.log('UPDATE tasks SET user_id = (SELECT id FROM users WHERE email = \'rbndchsn@gmail.com\');');
console.log('UPDATE relationships SET user_id = (SELECT id FROM users WHERE email = \'rbndchsn@gmail.com\');');
console.log('UPDATE accomplishments SET user_id = (SELECT id FROM users WHERE email = \'rbndchsn@gmail.com\');');
console.log('UPDATE weekly_logs SET user_id = (SELECT id FROM users WHERE email = \'rbndchsn@gmail.com\');');
console.log('');
console.log('='.repeat(80));
console.log('');
console.log('Copy the SQL above and add it to the end of migrations/001_add_auth.sql');
console.log('Then run: wrangler d1 execute apex-onboarding --file=migrations/001_add_auth.sql');
console.log('');
