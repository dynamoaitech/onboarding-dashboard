import { authenticateRequest } from '../utils/auth.js';

export async function onRequestGet({ request, env }) {
  try {
    // Authenticate request
    const user = await authenticateRequest(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Filter weekly_logs by user_id
    const { results } = await env.DB.prepare(
      'SELECT * FROM weekly_logs WHERE user_id = ? ORDER BY week'
    ).bind(user.id).all();

    return new Response(JSON.stringify(results), {
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
    // Authenticate request
    const user = await authenticateRequest(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { week, notes } = await request.json();

    // Check if weekly log exists for this user and week
    const existing = await env.DB.prepare(
      'SELECT id FROM weekly_logs WHERE user_id = ? AND week = ?'
    ).bind(user.id, week).first();

    if (existing) {
      // Update existing log
      await env.DB.prepare(
        'UPDATE weekly_logs SET notes = ? WHERE user_id = ? AND week = ?'
      ).bind(notes, user.id, week).run();
    } else {
      // Insert new log
      await env.DB.prepare(
        'INSERT INTO weekly_logs (user_id, week, notes) VALUES (?, ?, ?)'
      ).bind(user.id, week, notes).run();
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
