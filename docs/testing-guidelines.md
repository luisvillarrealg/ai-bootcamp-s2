# Testing Guidelines

Testing principles for the TODO app. All new features must include appropriate tests, and tests must be maintainable and follow best practices.

## Test Types

### Unit Tests

- Use Jest to test individual functions and React components in isolation.
- Naming convention: `*.test.js` or `*.test.ts`.
- Backend location: `packages/backend/__tests__/`.
- Frontend location: `packages/frontend/src/__tests__/`.
- Name test files to match what they test (e.g., `app.test.js` for `app.js`).

### Integration Tests

- Use Jest + Supertest to test **backend API endpoints** with real HTTP requests.
- Location: `packages/backend/__tests__/integration/`.
- Naming convention: `*.test.js` or `*.test.ts`.
- Name files based on what they test (e.g., `todos-api.test.js` for the TODO API endpoints).

### End-to-End (E2E) Tests

- Use Playwright (the required framework) to test **complete UI workflows** through browser automation.
- Location: `tests/e2e/`.
- Naming convention: `*.spec.js` or `*.spec.ts`.
- Name files based on the user journey they test (e.g., `todo-workflow.spec.js`).
- Use **one browser only**.
- Use the **Page Object Model (POM)** pattern for maintainability.
- Limit E2E tests to **5-8 critical user journeys**, focusing on happy paths and key edge cases rather than exhaustive coverage.

## Port Configuration

Always use environment variables with sensible defaults for ports so CI/CD workflows can detect them dynamically.

- Backend: `const PORT = process.env.PORT || 3030;`
- Frontend: React's default port is 3000, and can be overridden with the `PORT` environment variable.

## General Principles

- All tests must be isolated and independent: each test sets up its own data and does not rely on other tests.
- Setup and teardown hooks are required so tests succeed on multiple runs.
- All new features must include appropriate tests.
- Tests must be maintainable and follow best practices.
