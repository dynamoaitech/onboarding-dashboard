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

    // Filter relationships by user_id
    const { results } = await env.DB.prepare(
      'SELECT * FROM relationships WHERE user_id = ? ORDER BY id'
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

    const { id, name, status } = await request.json();

    // Verify relationship belongs to user before updating
    await env.DB.prepare(
      'UPDATE relationships SET name = ?, status = ? WHERE id = ? AND user_id = ?'
    ).bind(name, status, id, user.id).run();

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
