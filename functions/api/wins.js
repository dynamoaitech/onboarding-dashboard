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

    // Filter accomplishments by user_id
    const { results } = await env.DB.prepare(
      'SELECT * FROM accomplishments WHERE user_id = ? ORDER BY day DESC'
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

    const { text, day } = await request.json();

    // Include user_id in INSERT
    await env.DB.prepare(
      'INSERT INTO accomplishments (user_id, text, day) VALUES (?, ?, ?)'
    ).bind(user.id, text, day).run();

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
