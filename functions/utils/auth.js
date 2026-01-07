// Authentication Utilities for Cloudflare Pages Functions
// Uses Web Crypto API (compatible with Cloudflare Workers)

import * as jose from 'jose';

// ============================================================================
// PASSWORD HASHING (PBKDF2 with Web Crypto API)
// ============================================================================

/**
 * Generate a cryptographically secure random salt
 * @returns {string} Hex-encoded salt
 */
export async function generateSalt() {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  return bufferToHex(saltBytes);
}

/**
 * Hash a password using PBKDF2 (100,000 iterations, SHA-256)
 * @param {string} password - Plain text password
 * @param {string} saltHex - Hex-encoded salt
 * @returns {Promise<string>} Hex-encoded password hash
 */
export async function hashPassword(password, saltHex) {
  const salt = hexToBuffer(saltHex);
  const passwordBuffer = new TextEncoder().encode(password);

  // Import password as key material
  const key = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits']
  );

  // Derive hash using PBKDF2
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    key,
    256 // 256 bits = 32 bytes
  );

  return bufferToHex(new Uint8Array(hashBuffer));
}

/**
 * Verify a password against a stored hash
 * @param {string} password - Plain text password to verify
 * @param {string} storedHash - Hex-encoded stored password hash
 * @param {string} saltHex - Hex-encoded salt used for hashing
 * @returns {Promise<boolean>} True if password matches
 */
export async function verifyPassword(password, storedHash, saltHex) {
  const computedHash = await hashPassword(password, saltHex);
  return computedHash === storedHash;
}

// ============================================================================
// PASSWORD VALIDATION
// ============================================================================

/**
 * Validate password meets security requirements
 * @param {string} password - Password to validate
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validatePassword(password) {
  const errors = [];

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ============================================================================
// JWT TOKEN MANAGEMENT
// ============================================================================

/**
 * Create a JWT token for authenticated user
 * @param {number} userId - User ID
 * @param {string} name - User's full name
 * @param {string} email - User's email
 * @param {string} secret - JWT secret key
 * @returns {Promise<string>} Signed JWT token
 */
export async function createToken(userId, name, email, secret) {
  const secretKey = new TextEncoder().encode(secret);

  const token = await new jose.SignJWT({
    userId,
    name,
    email
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // 7 days
    .sign(secretKey);

  return token;
}

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @param {string} secret - JWT secret key
 * @returns {Promise<{userId: number, name: string, email: string} | null>} Decoded payload or null if invalid
 */
export async function verifyToken(token, secret) {
  try {
    const secretKey = new TextEncoder().encode(secret);

    const { payload } = await jose.jwtVerify(token, secretKey);

    return {
      userId: payload.userId,
      name: payload.name,
      email: payload.email
    };
  } catch (error) {
    // Token invalid, expired, or malformed
    return null;
  }
}

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

/**
 * Extract and verify authentication token from request cookie
 * @param {Request} request - Cloudflare Pages Functions request object
 * @param {Object} env - Environment variables (must contain JWT_SECRET)
 * @returns {Promise<{id: number, name: string, email: string} | null>} User object or null if not authenticated
 */
export async function authenticateRequest(request, env) {
  try {
    // Extract cookie header
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) {
      return null;
    }

    // Parse cookies
    const cookies = {};
    cookieHeader.split(';').forEach(cookie => {
      const [name, ...rest] = cookie.trim().split('=');
      cookies[name] = rest.join('=');
    });

    // Get auth token
    const token = cookies['auth_token'];
    if (!token) {
      return null;
    }

    // Verify token
    const jwtSecret = env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET not configured in environment');
      return null;
    }

    const payload = await verifyToken(token, jwtSecret);
    if (!payload) {
      return null;
    }

    // Return user object
    return {
      id: payload.userId,
      name: payload.name,
      email: payload.email
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert hex string to Uint8Array
 * @param {string} hex - Hex string
 * @returns {Uint8Array} Byte array
 */
function hexToBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Convert Uint8Array to hex string
 * @param {Uint8Array} buffer - Byte array
 * @returns {string} Hex string
 */
function bufferToHex(buffer) {
  return Array.from(buffer)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// ============================================================================
// RANDOM TOKEN GENERATION
// ============================================================================

/**
 * Generate a secure random token (for password resets)
 * @param {number} bytes - Number of random bytes (default: 32)
 * @returns {string} Hex-encoded random token
 */
export function generateRandomToken(bytes = 32) {
  const tokenBytes = crypto.getRandomValues(new Uint8Array(bytes));
  return bufferToHex(tokenBytes);
}
