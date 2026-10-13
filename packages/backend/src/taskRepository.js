function toTask(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    dueDate: row.due_date,
    priority: row.priority,
    completed: row.completed === 1,
    createdAt: row.created_at,
  };
}

function createTaskRepository(db) {
  const findStmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
  const listStmt = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC, id DESC');
  const insertStmt = db.prepare(
    'INSERT INTO tasks (title, description, due_date, priority, completed) VALUES (?, ?, ?, ?, ?)'
  );
  const deleteStmt = db.prepare('DELETE FROM tasks WHERE id = ?');

  function findById(id) {
    const row = findStmt.get(id);
    return row ? toTask(row) : null;
  }

  return {
    list() {
      return listStmt.all().map(toTask);
    },

    findById,

    create({ title, description = '', dueDate = null, priority = 'medium', completed = false }) {
      const result = insertStmt.run(title, description, dueDate, priority, completed ? 1 : 0);
      return findById(result.lastInsertRowid);
    },

    // Returns null when the task does not exist.
    update(id, changes) {
      const existing = findById(id);
      if (!existing) return null;

      const merged = { ...existing, ...changes };
      db.prepare(
        `UPDATE tasks
         SET title = ?, description = ?, due_date = ?, priority = ?, completed = ?
         WHERE id = ?`
      ).run(
        merged.title,
        merged.description,
        merged.dueDate,
        merged.priority,
        merged.completed ? 1 : 0,
        id
      );

      return findById(id);
    },

    remove(id) {
      return deleteStmt.run(id).changes > 0;
    },
  };
}

module.exports = { createTaskRepository };
