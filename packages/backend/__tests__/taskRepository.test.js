const { createDatabase } = require('../src/database');
const { createTaskRepository } = require('../src/taskRepository');

let db;
let repository;

beforeEach(() => {
  db = createDatabase();
  repository = createTaskRepository(db);
});

afterEach(() => {
  db.close();
});

describe('taskRepository', () => {
  it('creates a task with defaults', () => {
    const task = repository.create({ title: 'Buy milk' });

    expect(task).toMatchObject({
      title: 'Buy milk',
      description: '',
      dueDate: null,
      priority: 'medium',
      completed: false,
    });
    expect(task.id).toEqual(expect.any(Number));
    expect(task.createdAt).toBeTruthy();
  });

  it('creates a task that is already completed', () => {
    expect(repository.create({ title: 'Done', completed: true }).completed).toBe(true);
  });

  it('lists tasks with the newest first', () => {
    const first = repository.create({ title: 'First' });
    const second = repository.create({ title: 'Second' });

    expect(repository.list().map((task) => task.id)).toEqual([second.id, first.id]);
  });

  it('finds a task by id and returns null when missing', () => {
    const task = repository.create({ title: 'Find me' });

    expect(repository.findById(task.id)).toEqual(task);
    expect(repository.findById(9999)).toBeNull();
  });

  it('updates only the provided fields', () => {
    const task = repository.create({ title: 'Original', priority: 'low', dueDate: '2030-01-01' });

    const updated = repository.update(task.id, { title: 'Changed', completed: true });

    expect(updated).toMatchObject({
      title: 'Changed',
      completed: true,
      priority: 'low',
      dueDate: '2030-01-01',
    });
  });

  it('can clear the due date', () => {
    const task = repository.create({ title: 'Dated', dueDate: '2030-01-01' });

    expect(repository.update(task.id, { dueDate: null }).dueDate).toBeNull();
  });

  it('returns null when updating a missing task', () => {
    expect(repository.update(9999, { title: 'Nope' })).toBeNull();
  });

  it('removes a task and reports whether it existed', () => {
    const task = repository.create({ title: 'Delete me' });

    expect(repository.remove(task.id)).toBe(true);
    expect(repository.remove(task.id)).toBe(false);
    expect(repository.list()).toEqual([]);
  });
});
