export const PRIORITIES = ['low', 'medium', 'high'];

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

export const FILTERS = ['all', 'active', 'completed'];

function toDateString(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function isOverdue(task, now = new Date()) {
  return !task.completed && Boolean(task.dueDate) && task.dueDate < toDateString(now);
}

export function formatDueDate(dueDate) {
  const [year, month, day] = dueDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function compareDueDates(a, b) {
  if (a.dueDate === b.dueDate) return 0;
  if (!a.dueDate) return 1;
  if (!b.dueDate) return -1;
  return a.dueDate < b.dueDate ? -1 : 1;
}

// Active first, then earliest due date (undated last), then priority, then newest.
export function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;

    const byDueDate = compareDueDates(a, b);
    if (byDueDate !== 0) return byDueDate;

    const byPriority = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (byPriority !== 0) return byPriority;

    return b.id - a.id;
  });
}

export function filterTasks(tasks, filter) {
  if (filter === 'active') return tasks.filter((task) => !task.completed);
  if (filter === 'completed') return tasks.filter((task) => task.completed);
  return tasks;
}
