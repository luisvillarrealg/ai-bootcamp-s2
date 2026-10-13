import { useCallback, useEffect, useState } from 'react';
import * as tasksApi from '../api/tasksApi';

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [notice, setNotice] = useState(null);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setTasks(await tasksApi.fetchTasks());
      setLoadError(null);
    } catch (err) {
      setLoadError(`Failed to load tasks: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Runs an API call, reports the outcome, and resolves to whether it succeeded.
  const runAction = useCallback(async (action, successMessage, errorPrefix) => {
    try {
      await action();
      setNotice({ severity: 'success', message: successMessage });
      return true;
    } catch (err) {
      setNotice({ severity: 'error', message: `${errorPrefix}: ${err.message}` });
      return false;
    }
  }, []);

  const addTask = useCallback(
    (values) =>
      runAction(
        async () => {
          const created = await tasksApi.createTask(values);
          setTasks((current) => [created, ...current]);
        },
        'Task added',
        'Failed to add task'
      ),
    [runAction]
  );

  const editTask = useCallback(
    (id, changes, successMessage = 'Task updated') =>
      runAction(
        async () => {
          const updated = await tasksApi.updateTask(id, changes);
          setTasks((current) => current.map((task) => (task.id === id ? updated : task)));
        },
        successMessage,
        'Failed to update task'
      ),
    [runAction]
  );

  const removeTask = useCallback(
    (id) =>
      runAction(
        async () => {
          await tasksApi.deleteTask(id);
          setTasks((current) => current.filter((task) => task.id !== id));
        },
        'Task deleted',
        'Failed to delete task'
      ),
    [runAction]
  );

  const dismissNotice = useCallback(() => setNotice(null), []);

  return {
    tasks,
    loading,
    loadError,
    notice,
    dismissNotice,
    reload: loadTasks,
    addTask,
    editTask,
    removeTask,
  };
}
