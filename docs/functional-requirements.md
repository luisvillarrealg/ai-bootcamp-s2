# Functional Requirements

The TODO app should let a user manage tasks through their full lifecycle. These requirements describe the intended behavior of the application.

## Tasks

- The user can create a task with a required title and an optional description and due date.
- The app rejects a title that is empty or contains only whitespace.
- The user can edit a task's title, description, and due date.
- The user can mark a task as complete and can reopen a completed task.
- The user can delete a task.
- Tasks remain available after the app is restarted.

## Task List

- The app displays tasks with their title, completion status, and due date when one is set.
- The user can view all tasks, only incomplete tasks, or only completed tasks.
- Incomplete tasks appear before completed tasks.
- Within each status group, tasks with due dates are ordered by earliest due date first. Tasks without a due date follow tasks with a due date; ties are ordered by creation time, oldest first.
- A task with a due date before the current date is identified as overdue until it is completed.
- The app shows an empty state when the selected task list has no results.

## Input and Feedback

- The app validates task input and provides a clear message when a task cannot be created or updated.
- The app confirms a task was created, updated, completed, reopened, or deleted by reflecting the change in the task list.