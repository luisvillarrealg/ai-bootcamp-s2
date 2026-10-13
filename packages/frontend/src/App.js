import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import TaskFilter from './components/TaskFilter';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import { useTasks } from './hooks/useTasks';
import { filterTasks, sortTasks } from './utils/taskUtils';

function App() {
  const { tasks, loading, loadError, notice, dismissNotice, addTask, editTask, removeTask } =
    useTasks();
  const [filter, setFilter] = useState('all');
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  const visibleTasks = useMemo(() => sortTasks(filterTasks(tasks, filter)), [tasks, filter]);

  const handleToggle = (task) =>
    editTask(task.id, { completed: !task.completed }, task.completed ? 'Task reopened' : 'Task completed');

  const handleSaveEdit = async (values) => {
    const succeeded = await editTask(editingTask.id, values);
    if (succeeded) setEditingTask(null);
    return succeeded;
  };

  const handleConfirmDelete = async () => {
    await removeTask(deletingTask.id);
    setDeletingTask(null);
  };

  return (
    <Container maxWidth="sm" component="main" sx={{ py: 4 }}>
      <Box component="header" sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          To Do App
        </Typography>
        <Typography color="text.secondary">Keep track of your tasks</Typography>
      </Box>

      <Paper component="section" aria-labelledby="add-task-heading" sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" component="h2" id="add-task-heading" sx={{ mb: 2 }}>
          Add task
        </Typography>
        <TaskForm submitLabel="Add task" onSubmit={addTask} resetOnSuccess />
      </Paper>

      <Paper component="section" aria-labelledby="task-list-heading" sx={{ p: 2 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
        >
          <Typography variant="h6" component="h2" id="task-list-heading">
            Tasks
          </Typography>
          <TaskFilter value={filter} onChange={setFilter} />
        </Stack>
        <TaskList
          tasks={visibleTasks}
          loading={loading}
          loadError={loadError}
          hasAnyTasks={tasks.length > 0}
          onToggle={handleToggle}
          onEdit={setEditingTask}
          onDelete={setDeletingTask}
        />
      </Paper>

      <Dialog open={Boolean(editingTask)} onClose={() => setEditingTask(null)} fullWidth maxWidth="sm">
        <DialogTitle>Edit task</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {editingTask && (
            <Box sx={{ pt: 1 }}>
              <TaskForm
                initialValues={{
                  title: editingTask.title,
                  description: editingTask.description,
                  dueDate: editingTask.dueDate || '',
                  priority: editingTask.priority,
                }}
                submitLabel="Save changes"
                onSubmit={handleSaveEdit}
                onCancel={() => setEditingTask(null)}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deletingTask)} onClose={() => setDeletingTask(null)}>
        <DialogTitle>Delete task?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deletingTask && `"${deletingTask.title}" will be permanently deleted.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setDeletingTask(null)}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={4000}
        onClose={(event, reason) => reason !== 'clickaway' && dismissNotice()}
      >
        {notice ? (
          <Alert severity={notice.severity} onClose={dismissNotice} variant="filled">
            {notice.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Container>
  );
}

export default App;
