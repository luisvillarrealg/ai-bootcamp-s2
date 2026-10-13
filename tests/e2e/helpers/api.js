// Tasks are managed through the API (proxied via the frontend baseURL) so tests start from a known state.

async function getTasks(request) {
  const response = await request.get('/api/tasks');
  return response.json();
}

async function deleteAllTasks(request) {
  const tasks = await getTasks(request);

  for (const task of tasks) {
    await request.delete(`/api/tasks/${task.id}`);
  }
}

async function createTask(request, task) {
  const response = await request.post('/api/tasks', { data: task });
  return response.json();
}

module.exports = { deleteAllTasks, createTask, getTasks };
