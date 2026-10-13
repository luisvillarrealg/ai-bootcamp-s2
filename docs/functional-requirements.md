# Functional Requirements

Core functional requirements for the TODO app.

## Task Management

- FR-1: The user can create a task with a title (required) and an optional description.
- FR-2: The user can view a list of all tasks.
- FR-3: The user can edit a task's title, description, and due date.
- FR-4: The user can delete a task.
- FR-5: The user can mark a task as completed and revert it back to active.

## Due Dates

- FR-6: The user can add an optional due date to a task when creating or editing it.
- FR-7: The user can remove a due date from a task.
- FR-8: Tasks whose due date has passed and that are not completed are visually marked as overdue.

## Priority

- FR-9: The user can assign a priority (low, medium, high) to a task; the default is medium.

## Sorting and Filtering

- FR-10: By default, tasks are sorted with active tasks first, then by due date (earliest first), then by priority (high to low), then by creation time (newest first). Tasks without a due date appear after tasks with one.
- FR-11: Completed tasks are displayed after active tasks.
- FR-12: The user can filter the list by status: all, active, or completed.

## Validation

- FR-13: A task title cannot be empty or whitespace only, and is limited to 200 characters.
- FR-14: A due date must be a valid date.
- FR-15: The app shows a clear error message when validation fails or an operation cannot be completed.

## Persistence and API

- FR-16: Tasks are stored by the backend and persist across page reloads.
- FR-17: The backend exposes a REST API supporting create, read, update, and delete operations for tasks.
- FR-18: The UI reflects changes immediately after any create, update, or delete operation.

## User Interface

- FR-19: The UI shows an empty-state message when there are no tasks.
- FR-20: The UI is usable on both desktop and mobile screen sizes.
