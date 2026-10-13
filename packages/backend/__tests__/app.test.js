const request = require('supertest');
const { createDatabase } = require('../src/database');
const { createApp } = require('../src/app');

let db;
let app;

beforeEach(() => {
  db = createDatabase();
  app = createApp(db);
});

afterEach(() => {
  db.close();
});

describe('app', () => {
  it('responds to the health check', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', message: 'Backend server is running' });
  });

  it('returns 404 for unknown routes', async () => {
    const response = await request(app).get('/api/unknown');

    expect(response.status).toBe(404);
  });

  it('uses an isolated database for each app instance', async () => {
    await request(app).post('/api/tasks').send({ title: 'Only in first app' });
    const otherDb = createDatabase();
    const otherApp = createApp(otherDb);

    const response = await request(otherApp).get('/api/tasks');
    otherDb.close();

    expect(response.body).toEqual([]);
  });
});