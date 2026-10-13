import React from 'react';
import { Checkbox, Chip, IconButton, ListItem, ListItemIcon, ListItemText, Stack } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { formatDueDate, isOverdue } from '../utils/taskUtils';

const PRIORITY_COLORS = { high: 'error', medium: 'warning', low: 'success' };

function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const overdue = isOverdue(task);

  return (
    <ListItem
      divider
      data-testid="task-item"
      secondaryAction={
        <>
          <IconButton aria-label={`Edit task ${task.title}`} onClick={() => onEdit(task)}>
            <EditIcon />
          </IconButton>
          <IconButton
            aria-label={`Delete task ${task.title}`}
            color="error"
            onClick={() => onDelete(task)}
          >
            <DeleteIcon />
          </IconButton>
        </>
      }
      sx={{ pr: 14 }}
    >
      <ListItemIcon>
        <Checkbox
          edge="start"
          checked={task.completed}
          onChange={() => onToggle(task)}
          inputProps={{ 'aria-label': `Mark task ${task.title} as completed` }}
        />
      </ListItemIcon>
      <ListItemText
        primary={task.title}
        primaryTypographyProps={{
          variant: 'body1',
          'data-testid': 'task-title',
          sx: task.completed
            ? { textDecoration: 'line-through', color: 'text.secondary' }
            : undefined,
        }}
        secondary={
          <>
            {task.description && (
              <span style={{ display: 'block', overflowWrap: 'anywhere' }}>{task.description}</span>
            )}
            <Stack component="span" direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
              <Chip
                component="span"
                size="small"
                color={PRIORITY_COLORS[task.priority]}
                variant="outlined"
                label={`${task.priority.charAt(0).toUpperCase()}${task.priority.slice(1)} priority`}
              />
              {task.dueDate && (
                <Chip
                  component="span"
                  size="small"
                  variant="outlined"
                  icon={<EventIcon />}
                  label={`Due ${formatDueDate(task.dueDate)}`}
                />
              )}
              {overdue && (
                <Chip
                  component="span"
                  size="small"
                  color="error"
                  icon={<WarningAmberIcon />}
                  label="Overdue"
                />
              )}
            </Stack>
          </>
        }
        secondaryTypographyProps={{ component: 'div' }}
      />
    </ListItem>
  );
}

export default TaskItem;
