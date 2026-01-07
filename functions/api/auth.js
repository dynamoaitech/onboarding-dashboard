// Authentication API Endpoint
// Handles user signup, login, logout, and session verification

import {
  generateSalt,
  hashPassword,
  verifyPassword,
  validatePassword,
  createToken,
  authenticateRequest
} from '../utils/auth.js';

// ============================================================================
// GET /api/auth - Verify current session
// ============================================================================

export async function onRequestGet({ request, env }) {
  try {
    const user = await authenticateRequest(request, env);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Return current user info
    return new Response(JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// ============================================================================
// POST /api/auth - Handle signup, login, logout
// ============================================================================

export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    const { action } = data;

    // ========================================================================
    // ACTION: SIGNUP
    // ========================================================================
    if (action === 'signup') {
      const { name, email, password } = data;

      // Validate required fields
      if (!name || !name.trim()) {
        return new Response(JSON.stringify({ error: 'Name is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (!email || !email.trim()) {
        return new Response(JSON.stringify({ error: 'Email is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (!password) {
        return new Response(JSON.stringify({ error: 'Password is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Validate email format
      const emailLower = email.toLowerCase().trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailLower)) {
        return new Response(JSON.stringify({ error: 'Invalid email format' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Validate password requirements
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        return new Response(JSON.stringify({
          error: 'Password does not meet requirements',
          details: passwordValidation.errors
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Check if email already exists
      const existingUser = await env.DB.prepare(
        'SELECT id FROM users WHERE email = ?'
      ).bind(emailLower).first();

      if (existingUser) {
        return new Response(JSON.stringify({ error: 'Email already registered' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Generate salt and hash password
      const salt = await generateSalt();
      const password_hash = await hashPassword(password, salt);

      // Insert new user
      const result = await env.DB.prepare(
        'INSERT INTO users (name, email, password_hash, salt, created_at) VALUES (?, ?, ?, ?, ?)'
      ).bind(name.trim(), emailLower, password_hash, salt, Math.floor(Date.now() / 1000)).run();

      const userId = result.meta.last_row_id;

      // Create JWT token
      const token = await createToken(userId, name.trim(), emailLower, env.JWT_SECRET);

      // Set HTTP-only cookie
      const cookieOptions = [
        'HttpOnly',
        'Secure',
        'SameSite=Strict',
        `Max-Age=${7 * 24 * 60 * 60}`, // 7 days
        'Path=/'
      ].join('; ');

      return new Response(JSON.stringify({
        success: true,
        user: {
          id: userId,
          name: name.trim(),
          email: emailLower
        }
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': `auth_token=${token}; ${cookieOptions}`
        }
      });
    }

    // ========================================================================
    // ACTION: LOGIN
    // ========================================================================
    if (action === 'login') {
      const { email, password } = data;

      // Validate required fields
      if (!email || !password) {
        return new Response(JSON.stringify({ error: 'Email and password are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Find user by email (case-insensitive)
      const emailLower = email.toLowerCase().trim();
      const user = await env.DB.prepare(
        'SELECT id, name, email, password_hash, salt FROM users WHERE email = ?'
      ).bind(emailLower).first();

      if (!user) {
        return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Verify password
      const isValid = await verifyPassword(password, user.password_hash, user.salt);

      if (!isValid) {
        return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Update last_login timestamp
      await env.DB.prepare(
        'UPDATE users SET last_login = ? WHERE id = ?'
      ).bind(Math.floor(Date.now() / 1000), user.id).run();

      // Create JWT token
      const token = await createToken(user.id, user.name, user.email, env.JWT_SECRET);

      // Set HTTP-only cookie
      const cookieOptions = [
        'HttpOnly',
        'Secure',
        'SameSite=Strict',
        `Max-Age=${7 * 24 * 60 * 60}`, // 7 days
        'Path=/'
      ].join('; ');

      return new Response(JSON.stringify({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': `auth_token=${token}; ${cookieOptions}`
        }
      });
    }

    // ========================================================================
    // ACTION: LOGOUT
    // ========================================================================
    if (action === 'logout') {
      // Clear the auth_token cookie
      const cookieOptions = [
        'HttpOnly',
        'Secure',
        'SameSite=Strict',
        'Max-Age=0', // Expire immediately
        'Path=/'
      ].join('; ');

      return new Response(JSON.stringify({ success: true }), {
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': `auth_token=; ${cookieOptions}`
        }
      });
    }

    // Unknown action
    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Auth error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
