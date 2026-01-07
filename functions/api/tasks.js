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

    // Filter tasks by user_id
    const { results } = await env.DB.prepare(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY week, day'
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

    const data = await request.json();
    const { action } = data;

    // Toggle task completion status
    if (action === 'toggle' || (!action && data.completed !== undefined)) {
      const { id, completed } = data;
      const status = completed ? 'completed' : 'pending';

      // Verify task belongs to user before updating
      await env.DB.prepare(
        'UPDATE tasks SET status = ? WHERE id = ? AND user_id = ?'
      ).bind(status, id, user.id).run();

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create new task
    if (action === 'create') {
      const { week, day, task, category, priority } = data;

      if (!task || !category || !priority) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Include user_id in INSERT
      const result = await env.DB.prepare(
        'INSERT INTO tasks (user_id, week, day, task, category, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).bind(user.id, week || 1, day || 1, task, category, priority, 'pending').run();

      return new Response(JSON.stringify({ success: true, id: result.meta.last_row_id }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update task details
    if (action === 'update') {
      const { id, week, day, task, category, priority } = data;

      // Verify task belongs to user before updating
      await env.DB.prepare(
        'UPDATE tasks SET week = ?, day = ?, task = ?, category = ?, priority = ? WHERE id = ? AND user_id = ?'
      ).bind(week, day, task, category, priority, id, user.id).run();

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Delete task
    if (action === 'delete') {
      const { id } = data;

      // Verify task belongs to user before deleting
      await env.DB.prepare(
        'DELETE FROM tasks WHERE id = ? AND user_id = ?'
      ).bind(id, user.id).run();

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
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
