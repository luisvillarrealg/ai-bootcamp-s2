const { PRIORITIES } = require('./database');

const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 1000;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(value) {
  if (!DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

// Returns { errors, values }; with partial=true only provided fields are validated.
function validateTaskInput(body, { partial = false } = {}) {
  const errors = [];
  const values = {};
  const input = body && typeof body === 'object' ? body : {};

  if (input.title !== undefined || !partial) {
    if (typeof input.title !== 'string' || input.title.trim() === '') {
      errors.push('Title is required');
    } else if (input.title.trim().length > MAX_TITLE_LENGTH) {
      errors.push(`Title must be ${MAX_TITLE_LENGTH} characters or fewer`);
    } else {
      values.title = input.title.trim();
    }
  }

  if (input.description !== undefined) {
    if (typeof input.description !== 'string') {
      errors.push('Description must be a string');
    } else if (input.description.length > MAX_DESCRIPTION_LENGTH) {
      errors.push(`Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer`);
    } else {
      values.description = input.description.trim();
    }
  }

  if (input.dueDate !== undefined) {
    if (input.dueDate === null || input.dueDate === '') {
      values.dueDate = null;
    } else if (typeof input.dueDate !== 'string' || !isValidDate(input.dueDate)) {
      errors.push('Due date must be a valid date in YYYY-MM-DD format');
    } else {
      values.dueDate = input.dueDate;
    }
  }

  if (input.priority !== undefined) {
    if (!PRIORITIES.includes(input.priority)) {
      errors.push(`Priority must be one of: ${PRIORITIES.join(', ')}`);
    } else {
      values.priority = input.priority;
    }
  }

  if (input.completed !== undefined) {
    if (typeof input.completed !== 'boolean') {
      errors.push('Completed must be a boolean');
    } else {
      values.completed = input.completed;
    }
  }

  return { errors, values };
}

module.exports = { validateTaskInput, MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH };
