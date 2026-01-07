// Password Reset API Endpoint
// Handles password reset requests and completions

import {
  generateRandomToken,
  generateSalt,
  hashPassword,
  validatePassword
} from '../utils/auth.js';

// ============================================================================
// POST /api/reset-password - Handle password reset flow
// ============================================================================

export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    const { action } = data;

    // ========================================================================
    // ACTION: REQUEST - Generate password reset token
    // ========================================================================
    if (action === 'request') {
      const { email } = data;

      if (!email || !email.trim()) {
        return new Response(JSON.stringify({ error: 'Email is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const emailLower = email.toLowerCase().trim();

      // Find user by email
      const user = await env.DB.prepare(
        'SELECT id, name, email FROM users WHERE email = ?'
      ).bind(emailLower).first();

      if (!user) {
        // Don't reveal if email exists or not (security best practice)
        return new Response(JSON.stringify({
          success: true,
          message: 'If an account exists with this email, a reset token has been generated'
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Generate secure random token
      const token = generateRandomToken(32); // 32 bytes = 64 hex characters

      // Token expires in 1 hour
      const expiresAt = Math.floor(Date.now() / 1000) + (60 * 60);
      const createdAt = Math.floor(Date.now() / 1000);

      // Store token in database
      await env.DB.prepare(
        'INSERT INTO password_reset_tokens (user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?)'
      ).bind(user.id, token, expiresAt, createdAt).run();

      // TEMPORARY: Return token in response (until email integration is added)
      // TODO: Send email with reset link containing this token
      return new Response(JSON.stringify({
        success: true,
        message: 'Password reset token generated',
        token: token, // TEMPORARY - remove when email is integrated
        expiresIn: '1 hour'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // ========================================================================
    // ACTION: RESET - Complete password reset with token
    // ========================================================================
    if (action === 'reset') {
      const { token, newPassword } = data;

      if (!token || !newPassword) {
        return new Response(JSON.stringify({ error: 'Token and new password are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Validate new password
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.valid) {
        return new Response(JSON.stringify({
          error: 'Password does not meet requirements',
          details: passwordValidation.errors
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Find token in database
      const resetToken = await env.DB.prepare(
        'SELECT id, user_id, expires_at, used FROM password_reset_tokens WHERE token = ?'
      ).bind(token).first();

      if (!resetToken) {
        return new Response(JSON.stringify({ error: 'Invalid reset token' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Check if token has been used
      if (resetToken.used) {
        return new Response(JSON.stringify({ error: 'Reset token has already been used' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Check if token has expired
      const now = Math.floor(Date.now() / 1000);
      if (now > resetToken.expires_at) {
        return new Response(JSON.stringify({ error: 'Reset token has expired' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Generate new salt and hash new password
      const newSalt = await generateSalt();
      const newPasswordHash = await hashPassword(newPassword, newSalt);

      // Update user password
      await env.DB.prepare(
        'UPDATE users SET password_hash = ?, salt = ? WHERE id = ?'
      ).bind(newPasswordHash, newSalt, resetToken.user_id).run();

      // Mark token as used
      await env.DB.prepare(
        'UPDATE password_reset_tokens SET used = 1 WHERE id = ?'
      ).bind(resetToken.id).run();

      // TODO: Invalidate all existing sessions for this user (optional security measure)
      // This would require a sessions table or token blacklist

      return new Response(JSON.stringify({
        success: true,
        message: 'Password has been reset successfully'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Unknown action
    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
