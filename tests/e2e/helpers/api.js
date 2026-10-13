// Tasks are managed through the API (proxied via the frontend baseURL) so tests start from a known state.

async function deleteAllTasks(request) {
  const response = await request.get('/api/tasks');
  const tasks = await response.json();

  for (const task of tasks) {
    await request.delete(`/api/tasks/${task.id}`);
  }
}

// The create endpoint ignores `completed`, so completed tasks are marked with a follow-up update.
async function createTask(request, { completed, ...task }) {
  const response = await request.post('/api/tasks', { data: task });
  const created = await response.json();

  if (completed) {
    const updated = await request.put(`/api/tasks/${created.id}`, { data: { completed } });
    return updated.json();
  }
  return created;
}

module.exports = { deleteAllTasks, createTask };
