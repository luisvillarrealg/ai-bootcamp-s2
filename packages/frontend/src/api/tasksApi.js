async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || `Request failed with status ${response.status}`);
  }
  return body;
}

export function fetchTasks() {
  return request('/api/tasks');
}

export function createTask(task) {
  return request('/api/tasks', { method: 'POST', body: JSON.stringify(task) });
}

export function updateTask(id, changes) {
  return request(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(changes) });
}

export function deleteTask(id) {
  return request(`/api/tasks/${id}`, { method: 'DELETE' });
}
