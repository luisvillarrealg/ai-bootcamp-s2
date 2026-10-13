import React, { useState } from 'react';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { PRIORITIES } from '../utils/taskUtils';

export const MAX_TITLE_LENGTH = 200;

const EMPTY_VALUES = { title: '', description: '', dueDate: '', priority: 'medium' };

function validateTitle(title) {
  if (title.trim() === '') return 'Title is required';
  if (title.trim().length > MAX_TITLE_LENGTH) {
    return `Title must be ${MAX_TITLE_LENGTH} characters or fewer`;
  }
  return '';
}

function TaskForm({
  initialValues = EMPTY_VALUES,
  submitLabel,
  onSubmit,
  onCancel,
  resetOnSuccess = false,
}) {
  const [values, setValues] = useState({ ...EMPTY_VALUES, ...initialValues });
  const [titleError, setTitleError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    if (field === 'title') setTitleError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const error = validateTitle(values.title);
    if (error) {
      setTitleError(error);
      return;
    }

    setSubmitting(true);
    const succeeded = await onSubmit({
      title: values.title.trim(),
      description: values.description.trim(),
      dueDate: values.dueDate || null,
      priority: values.priority,
    });
    setSubmitting(false);

    if (succeeded && resetOnSuccess) setValues(EMPTY_VALUES);
  };

  return (
    <form onSubmit={handleSubmit} noValidate data-testid="task-form">
      <Stack spacing={2}>
        <TextField
          label="Title"
          value={values.title}
          onChange={handleChange('title')}
          error={Boolean(titleError)}
          helperText={titleError}
          required
          fullWidth
          autoFocus={Boolean(onCancel)}
        />
        <TextField
          label="Description"
          value={values.description}
          onChange={handleChange('description')}
          multiline
          minRows={2}
          fullWidth
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Due date"
            type="date"
            value={values.dueDate}
            onChange={handleChange('dueDate')}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Priority"
            select
            value={values.priority}
            onChange={handleChange('priority')}
            fullWidth
          >
            {PRIORITIES.map((priority) => (
              <MenuItem key={priority} value={priority}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          {onCancel && (
            <Button variant="outlined" onClick={onCancel} type="button">
              Cancel
            </Button>
          )}
          <Button variant="contained" type="submit" disabled={submitting}>
            {submitLabel}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}

export default TaskForm;
