const express = require('express');
const request = require('supertest');
const { createTasksRouter } = require('../src/routes/tasks');

// A repository whose every operation fails, to exercise the error handling paths.
const failingRepository = {
  list: () => {
    throw new Error('db down');
  },
  create: () => {
    throw new Error('db down');
  },
  update: () => {
    throw new Error('db down');
  },
  remove: () => {
    throw new Error('db down');
  },
};

const app = express();
app.use(express.json());
app.use('/api/tasks', createTasksRouter(failingRepository));

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('tasks router error handling', () => {
  it.each([
    ['get', '/api/tasks', undefined, 'Failed to fetch tasks'],
    ['post', '/api/tasks', { title: 'A' }, 'Failed to create task'],
    ['put', '/api/tasks/1', { title: 'A' }, 'Failed to update task'],
    ['delete', '/api/tasks/1', undefined, 'Failed to delete task'],
  ])('returns 500 without leaking details for %s %s', async (method, url, body, message) => {
    const response = await request(app)[method](url).send(body);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: message });
    expect(console.error).toHaveBeenCalled();
  });
});
