export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      'SELECT * FROM tasks ORDER BY week, day'
    ).all();

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
    const data = await request.json();
    const { action } = data;

    // Toggle task completion status
    if (action === 'toggle' || (!action && data.completed !== undefined)) {
      const { id, completed } = data;
      const status = completed ? 'completed' : 'pending';

      await env.DB.prepare(
        'UPDATE tasks SET status = ? WHERE id = ?'
      ).bind(status, id).run();

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

      const result = await env.DB.prepare(
        'INSERT INTO tasks (week, day, task, category, priority, status) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(week || 1, day || 1, task, category, priority, 'pending').run();

      return new Response(JSON.stringify({ success: true, id: result.meta.last_row_id }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update task details
    if (action === 'update') {
      const { id, week, day, task, category, priority } = data;

      await env.DB.prepare(
        'UPDATE tasks SET week = ?, day = ?, task = ?, category = ?, priority = ? WHERE id = ?'
      ).bind(week, day, task, category, priority, id).run();

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Delete task
    if (action === 'delete') {
      const { id } = data;

      await env.DB.prepare(
        'DELETE FROM tasks WHERE id = ?'
      ).bind(id).run();

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
