import React from 'react';
import { Alert, Box, CircularProgress, List, Typography } from '@mui/material';
import TaskItem from './TaskItem';

function TaskList({ tasks, loading, loadError, hasAnyTasks, onToggle, onEdit, onDelete }) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress aria-label="Loading tasks" />
      </Box>
    );
  }

  if (loadError) {
    return <Alert severity="error">{loadError}</Alert>;
  }

  if (tasks.length === 0) {
    return (
      <Typography color="text.secondary" align="center" sx={{ p: 3 }}>
        {hasAnyTasks ? 'No tasks match this filter.' : 'No tasks yet. Add your first task above!'}
      </Typography>
    );
  }

  return (
    <List aria-label="Tasks">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </List>
  );
}

export default TaskList;
