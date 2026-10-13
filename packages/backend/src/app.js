const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { createDatabase } = require('./database');
const { createTaskRepository } = require('./taskRepository');
const { createTasksRouter } = require('./routes/tasks');

// Each app gets its own database so tests stay isolated.
function createApp(db = createDatabase()) {
  const app = express();

  app.use(cors());
  app.use(express.json());
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Backend server is running' });
  });

  app.use('/api/tasks', createTasksRouter(createTaskRepository(db)));

  return app;
}

module.exports = { createApp };