import { authenticateRequest } from '../utils/auth.js';

export async function onRequestGet({ request, env }) {
  try {
    // Authenticate
    const user = await authenticateRequest(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get user's current day
    const result = await env.DB.prepare(
      'SELECT current_day FROM users WHERE id = ?'
    ).bind(user.id).first();

    return new Response(JSON.stringify({
      currentDay: result?.current_day || 1
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

export async function onRequestPost({ request, env }) {
  try {
    // Authenticate
    const user = await authenticateRequest(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { action, day } = await request.json();

    if (action === 'update') {
      // Validate day is within bounds
      if (day < 1 || day > 30) {
        return new Response(JSON.stringify({
          error: 'Day must be between 1 and 30'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Update user's current day
      await env.DB.prepare(
        'UPDATE users SET current_day = ? WHERE id = ?'
      ).bind(day, user.id).run();

      return new Response(JSON.stringify({
        success: true,
        currentDay: day
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      error: 'Invalid action'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
