const express = require('express');
const { validateTaskInput } = require('../taskValidation');

function parseId(value) {
  return /^\d+$/.test(value) ? parseInt(value, 10) : null;
}

function createTasksRouter(repository) {
  const router = express.Router();

  router.get('/', (req, res) => {
    try {
      res.json(repository.list());
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  });

  router.post('/', (req, res) => {
    try {
      const { errors, values } = validateTaskInput(req.body);
      if (errors.length > 0) {
        return res.status(400).json({ error: errors[0], errors });
      }

      res.status(201).json(repository.create(values));
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  });

  router.put('/:id', (req, res) => {
    try {
      const id = parseId(req.params.id);
      if (id === null) {
        return res.status(400).json({ error: 'Valid task ID is required' });
      }

      const { errors, values } = validateTaskInput(req.body, { partial: true });
      if (errors.length > 0) {
        return res.status(400).json({ error: errors[0], errors });
      }

      const task = repository.update(id, values);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.json(task);
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  });

  router.delete('/:id', (req, res) => {
    try {
      const id = parseId(req.params.id);
      if (id === null) {
        return res.status(400).json({ error: 'Valid task ID is required' });
      }

      if (!repository.remove(id)) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.json({ message: 'Task deleted successfully', id });
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  });

  return router;
}

module.exports = { createTasksRouter };
