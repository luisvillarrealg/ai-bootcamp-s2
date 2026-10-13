import React from 'react';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { FILTERS } from '../utils/taskUtils';

function TaskFilter({ value, onChange }) {
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      size="small"
      aria-label="Filter tasks by status"
      onChange={(event, next) => next && onChange(next)}
    >
      {FILTERS.map((filter) => (
        <ToggleButton key={filter} value={filter} sx={{ textTransform: 'none', minHeight: 44 }}>
          {filter.charAt(0).toUpperCase() + filter.slice(1)}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

export default TaskFilter;
