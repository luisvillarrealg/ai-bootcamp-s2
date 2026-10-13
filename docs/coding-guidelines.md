# Coding Guidelines

This document summarizes the coding style and quality principles for the TODO app. The goal is a consistent, readable, and maintainable codebase across the frontend and backend.

## Formatting

Code follows the style already used in the project: two-space indentation, single quotes for strings, semicolons at the end of statements, and trailing commas in multi-line objects and arrays. Keep lines reasonably short (about 100 characters) and use blank lines to separate logical blocks. Use `const` by default, `let` only when reassignment is needed, and never `var`.

## Naming

- Variables and functions use `camelCase`; React components and classes use `PascalCase`; constants that are true configuration values use `UPPER_SNAKE_CASE`.
- Names describe intent (`getOverdueTasks`, not `getData`). Boolean names read as questions (`isCompleted`, `hasDueDate`).
- React component files are named after the component (e.g., `TaskList.js`).

## Module and Import Organization

The backend uses CommonJS (`require` / `module.exports`) and the frontend uses ES modules (`import` / `export`). Group imports in this order, separated by a blank line:

1. Node.js built-in modules
2. Third-party packages
3. Local modules (relative paths)
4. Styles and static assets (frontend only)

Import only what is used, and avoid circular dependencies.

## Linting

Use ESLint to catch bugs and enforce style, and run it before committing. Fix warnings rather than disabling rules; when a rule must be disabled, do it for the narrowest scope possible and add a short comment explaining why. No ESLint or Prettier configuration exists in the repository yet; when one is added, it becomes the source of truth over the conventions in this document.

## Design Principles

- **DRY**: Do not duplicate logic. When the same code appears in more than one place, extract it into a shared function, hook, or component. Avoid abstracting too early, though: wait until duplication is real, not speculative.
- **Single responsibility**: Each function, component, and module does one thing. Split large functions and components into smaller ones.
- **Keep it simple**: Prefer the simplest solution that meets the requirements; avoid unnecessary features and over-engineering.
- **Pure functions where possible**: Keep business logic (such as task sorting and validation) free of side effects so it is easy to test.
- **Separation of concerns**: Keep UI, API calls, and business logic separate. Backend route handlers stay thin and delegate to reusable logic.

## Error Handling

Validate input at system boundaries (API requests and form fields) and return clear, consistent error responses with appropriate HTTP status codes. Do not swallow errors silently; handle them or let them propagate. Never expose internal details such as stack traces to API clients.

## Comments and Documentation

Write self-explanatory code first. Comment only to explain why something is done, not what the code does. Remove commented-out code rather than leaving it in the repository. Update the documentation in `docs/` when behavior or conventions change.

## Security

Use parameterized queries for all database access, never string concatenation. Validate and sanitize user input, and do not commit secrets; read configuration from environment variables.

## Testing

All new features include appropriate tests, following the [Testing Guidelines](testing-guidelines.md).
