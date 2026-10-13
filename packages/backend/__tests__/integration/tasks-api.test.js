const request = require('supertest');
const { createDatabase } = require('../../src/database');
const { createApp } = require('../../src/app');

let db;
let app;

beforeEach(() => {
  db = createDatabase();
  app = createApp(db);
});

afterEach(() => {
  db.close();
});

const createTask = async (overrides = {}) => {
  const response = await request(app)
    .post('/api/tasks')
    .send({ title: 'Test task', ...overrides });

  expect(response.status).toBe(201);
  return response.body;
};

describe('Tasks API', () => {
  describe('GET /api/tasks', () => {
    it('returns an empty list when there are no tasks', async () => {
      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('returns all created tasks', async () => {
      await createTask({ title: 'One' });
      await createTask({ title: 'Two' });

      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(200);
      expect(response.body.map((task) => task.title).sort()).toEqual(['One', 'Two']);
    });

    it('returns the newest task first', async () => {
      await createTask({ title: 'Older' });
      await createTask({ title: 'Newer' });

      const response = await request(app).get('/api/tasks');

      expect(response.body.map((task) => task.title)).toEqual(['Newer', 'Older']);
    });
  });

  describe('POST /api/tasks', () => {
    it('creates a task with defaults', async () => {
      const response = await request(app).post('/api/tasks').send({ title: 'Buy milk' });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        title: 'Buy milk',
        description: '',
        dueDate: null,
        priority: 'medium',
        completed: false,
      });
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('createdAt');
    });

    it('creates a task with a due date, description, and priority', async () => {
      const response = await request(app).post('/api/tasks').send({
        title: 'Report',
        description: 'Quarterly',
        dueDate: '2030-05-20',
        priority: 'high',
      });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        description: 'Quarterly',
        dueDate: '2030-05-20',
        priority: 'high',
      });
    });

    it('persists the created task', async () => {
      const created = await createTask({ title: 'Persisted' });

      const response = await request(app).get('/api/tasks');

      expect(response.body).toEqual([created]);
    });

    it('trims the title and creates a completed task when requested', async () => {
      const created = await createTask({ title: '  Padded  ', completed: true });

      expect(created.title).toBe('Padded');
      expect(created.completed).toBe(true);
    });

    it('stores SQL special characters literally', async () => {
      const title = "Robert'); DROP TABLE tasks;--";
      await createTask({ title });

      const response = await request(app).get('/api/tasks');

      expect(response.body.map((task) => task.title)).toEqual([title]);
    });

    it('does not create a task when validation fails', async () => {
      await request(app).post('/api/tasks').send({ title: '' });

      const response = await request(app).get('/api/tasks');

      expect(response.body).toEqual([]);
    });

    it.each([
      [{}, 'Title is required'],
      [{ title: '' }, 'Title is required'],
      [{ title: '   ' }, 'Title is required'],
      [{ title: 'a'.repeat(201) }, 'Title must be 200 characters or fewer'],
      [{ title: 'A', dueDate: 'not-a-date' }, 'Due date must be a valid date in YYYY-MM-DD format'],
      [{ title: 'A', priority: 'urgent' }, 'Priority must be one of: low, medium, high'],
    ])('returns 400 for invalid body %j', async (body, message) => {
      const response = await request(app).post('/api/tasks').send(body);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(message);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('updates the title, description, due date, and priority', async () => {
      const task = await createTask();

      const response = await request(app).put(`/api/tasks/${task.id}`).send({
        title: 'Edited',
        description: 'New description',
        dueDate: '2031-01-15',
        priority: 'low',
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: task.id,
        title: 'Edited',
        description: 'New description',
        dueDate: '2031-01-15',
        priority: 'low',
      });
    });

    it('marks a task as completed and back to active', async () => {
      const task = await createTask();

      const completed = await request(app).put(`/api/tasks/${task.id}`).send({ completed: true });
      const active = await request(app).put(`/api/tasks/${task.id}`).send({ completed: false });

      expect(completed.body.completed).toBe(true);
      expect(active.body.completed).toBe(false);
    });

    it('leaves fields that were not sent unchanged and persists the update', async () => {
      const task = await createTask({
        title: 'Keep',
        description: 'Keep too',
        dueDate: '2030-01-01',
        priority: 'high',
      });

      await request(app).put(`/api/tasks/${task.id}`).send({ completed: true });

      const list = await request(app).get('/api/tasks');
      expect(list.body).toEqual([{ ...task, completed: true }]);
    });

    it('does not modify the task when validation fails', async () => {
      const task = await createTask({ title: 'Stable' });

      await request(app).put(`/api/tasks/${task.id}`).send({ title: '', priority: 'high' });

      const list = await request(app).get('/api/tasks');
      expect(list.body).toEqual([task]);
    });

    it('removes a due date', async () => {
      const task = await createTask({ dueDate: '2030-01-01' });

      const response = await request(app).put(`/api/tasks/${task.id}`).send({ dueDate: null });

      expect(response.status).toBe(200);
      expect(response.body.dueDate).toBeNull();
    });

    it('returns 400 for invalid data', async () => {
      const task = await createTask();

      const response = await request(app).put(`/api/tasks/${task.id}`).send({ title: '' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Title is required');
    });

    it('returns 400 for an invalid id', async () => {
      const response = await request(app).put('/api/tasks/abc').send({ title: 'X' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Valid task ID is required');
    });

    it('returns 404 when the task does not exist', async () => {
      const response = await request(app).put('/api/tasks/999999').send({ title: 'X' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('deletes an existing task', async () => {
      const task = await createTask();

      const response = await request(app).delete(`/api/tasks/${task.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Task deleted successfully', id: task.id });

      const list = await request(app).get('/api/tasks');
      expect(list.body).toEqual([]);
    });

    it('returns 404 when deleting the same task twice', async () => {
      const task = await createTask();
      await request(app).delete(`/api/tasks/${task.id}`);

      const response = await request(app).delete(`/api/tasks/${task.id}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });

    it('only deletes the requested task', async () => {
      const keep = await createTask({ title: 'Keep' });
      const remove = await createTask({ title: 'Remove' });

      await request(app).delete(`/api/tasks/${remove.id}`);

      const list = await request(app).get('/api/tasks');
      expect(list.body).toEqual([keep]);
    });

    it('returns 400 for an invalid id', async () => {
      const response = await request(app).delete('/api/tasks/abc');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Valid task ID is required');
    });
  });
});
