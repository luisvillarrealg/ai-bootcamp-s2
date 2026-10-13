import { filterTasks, formatDueDate, isOverdue, sortTasks } from '../utils/taskUtils';

const makeTask = (overrides) => ({
  id: 1,
  title: 'Task',
  description: '',
  dueDate: null,
  priority: 'medium',
  completed: false,
  createdAt: '2030-01-01 00:00:00',
  ...overrides,
});

describe('isOverdue', () => {
  const now = new Date(2030, 5, 15, 12, 0, 0);

  it('is true for an active task with a past due date', () => {
    expect(isOverdue(makeTask({ dueDate: '2030-06-14' }), now)).toBe(true);
  });

  it('is false for a task due today or later', () => {
    expect(isOverdue(makeTask({ dueDate: '2030-06-15' }), now)).toBe(false);
    expect(isOverdue(makeTask({ dueDate: '2030-06-16' }), now)).toBe(false);
  });

  it('is false for completed tasks and tasks without a due date', () => {
    expect(isOverdue(makeTask({ dueDate: '2030-06-01', completed: true }), now)).toBe(false);
    expect(isOverdue(makeTask({ dueDate: null }), now)).toBe(false);
  });
});

describe('formatDueDate', () => {
  it('formats a date string without timezone shifts', () => {
    expect(formatDueDate('2030-05-20')).toBe('May 20, 2030');
  });
});

describe('sortTasks', () => {
  it('puts active tasks before completed tasks', () => {
    const tasks = [makeTask({ id: 1, completed: true }), makeTask({ id: 2 })];

    expect(sortTasks(tasks).map((task) => task.id)).toEqual([2, 1]);
  });

  it('sorts by earliest due date and places undated tasks last', () => {
    const tasks = [
      makeTask({ id: 1, dueDate: null }),
      makeTask({ id: 2, dueDate: '2030-03-01' }),
      makeTask({ id: 3, dueDate: '2030-01-01' }),
    ];

    expect(sortTasks(tasks).map((task) => task.id)).toEqual([3, 2, 1]);
  });

  it('sorts by priority (high first) when due dates are equal', () => {
    const tasks = [
      makeTask({ id: 1, priority: 'low' }),
      makeTask({ id: 2, priority: 'high' }),
      makeTask({ id: 3, priority: 'medium' }),
    ];

    expect(sortTasks(tasks).map((task) => task.id)).toEqual([2, 3, 1]);
  });

  it('sorts newest first when everything else is equal', () => {
    const tasks = [makeTask({ id: 1 }), makeTask({ id: 3 }), makeTask({ id: 2 })];

    expect(sortTasks(tasks).map((task) => task.id)).toEqual([3, 2, 1]);
  });

  it('does not mutate the input array', () => {
    const tasks = [makeTask({ id: 1, completed: true }), makeTask({ id: 2 })];

    sortTasks(tasks);

    expect(tasks.map((task) => task.id)).toEqual([1, 2]);
  });
});

describe('filterTasks', () => {
  const tasks = [makeTask({ id: 1, completed: true }), makeTask({ id: 2 })];

  it('returns all tasks for the "all" filter', () => {
    expect(filterTasks(tasks, 'all')).toHaveLength(2);
  });

  it('returns only active tasks for the "active" filter', () => {
    expect(filterTasks(tasks, 'active').map((task) => task.id)).toEqual([2]);
  });

  it('returns only completed tasks for the "completed" filter', () => {
    expect(filterTasks(tasks, 'completed').map((task) => task.id)).toEqual([1]);
  });
});
