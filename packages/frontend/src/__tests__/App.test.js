import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';
import { renderWithTheme as render } from '../testUtils';

let tasks;
let nextId;

const server = setupServer(
  rest.get('/api/tasks', (req, res, ctx) => res(ctx.json(tasks))),

  rest.post('/api/tasks', (req, res, ctx) => {
    const task = {
      id: nextId++,
      description: '',
      dueDate: null,
      priority: 'medium',
      completed: false,
      createdAt: '2030-01-01 00:00:00',
      ...req.body,
    };
    tasks = [task, ...tasks];
    return res(ctx.status(201), ctx.json(task));
  }),

  rest.put('/api/tasks/:id', (req, res, ctx) => {
    const id = Number(req.params.id);
    tasks = tasks.map((task) => (task.id === id ? { ...task, ...req.body } : task));
    return res(ctx.json(tasks.find((task) => task.id === id)));
  }),

  rest.delete('/api/tasks/:id', (req, res, ctx) => {
    const id = Number(req.params.id);
    tasks = tasks.filter((task) => task.id !== id);
    return res(ctx.json({ message: 'Task deleted successfully', id }));
  })
);

const makeTask = (overrides) => ({
  id: nextId++,
  title: 'Task',
  description: '',
  dueDate: null,
  priority: 'medium',
  completed: false,
  createdAt: '2030-01-01 00:00:00',
  ...overrides,
});

beforeAll(() => server.listen());
beforeEach(() => {
  tasks = [];
  nextId = 1;
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const renderApp = async () => {
  render(<App />);
  await waitFor(() => expect(screen.queryByLabelText('Loading tasks')).not.toBeInTheDocument());
};

const getTaskTitles = () => screen.queryAllByTestId('task-title').map((title) => title.textContent);

describe('App', () => {
  it('renders the header and the empty state', async () => {
    await renderApp();

    expect(screen.getByRole('heading', { name: 'To Do App' })).toBeInTheDocument();
    expect(screen.getByText('No tasks yet. Add your first task above!')).toBeInTheDocument();
  });

  it('loads and displays existing tasks', async () => {
    tasks = [makeTask({ title: 'First' }), makeTask({ title: 'Second' })];

    await renderApp();

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('shows an error when loading tasks fails', async () => {
    server.use(rest.get('/api/tasks', (req, res, ctx) => res(ctx.status(500))));

    await renderApp();

    expect(await screen.findByText(/Failed to load tasks/)).toBeInTheDocument();
  });

  it('adds a new task with a due date and priority', async () => {
    await renderApp();

    await userEvent.type(screen.getByLabelText(/Title/), 'Buy milk');
    await userEvent.type(screen.getByLabelText('Due date'), '2099-05-20');
    await userEvent.click(screen.getByRole('combobox', { name: 'Priority' }));
    await userEvent.click(screen.getByRole('option', { name: 'High' }));
    await userEvent.click(screen.getByRole('button', { name: 'Add task' }));

    expect(await screen.findByText('Buy milk')).toBeInTheDocument();
    expect(screen.getByText('Due May 20, 2099')).toBeInTheDocument();
    expect(screen.getByText('High priority')).toBeInTheDocument();
    expect(await screen.findByText('Task added')).toBeInTheDocument();
  });

  it('shows an error message when adding a task fails', async () => {
    server.use(
      rest.post('/api/tasks', (req, res, ctx) =>
        res(ctx.status(400), ctx.json({ error: 'Title is required' }))
      )
    );
    await renderApp();

    await userEvent.type(screen.getByLabelText(/Title/), 'Buy milk');
    await userEvent.click(screen.getByRole('button', { name: 'Add task' }));

    expect(await screen.findByText('Failed to add task: Title is required')).toBeInTheDocument();
  });

  it('edits an existing task', async () => {
    tasks = [makeTask({ title: 'Old title' })];
    await renderApp();

    await userEvent.click(screen.getByRole('button', { name: 'Edit task Old title' }));
    const dialog = await screen.findByRole('dialog', { name: 'Edit task' });
    const titleInput = within(dialog).getByLabelText(/Title/);
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'New title');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('New title')).toBeInTheDocument();
    expect(screen.queryByText('Old title')).not.toBeInTheDocument();
  });

  it('completes and reopens a task', async () => {
    tasks = [makeTask({ title: 'Toggle me' })];
    await renderApp();

    const checkbox = screen.getByRole('checkbox', { name: 'Mark task Toggle me as completed' });
    await userEvent.click(checkbox);
    await waitFor(() => expect(checkbox).toBeChecked());

    await userEvent.click(checkbox);
    await waitFor(() => expect(checkbox).not.toBeChecked());
  });

  it('deletes a task after confirmation', async () => {
    tasks = [makeTask({ title: 'Delete me' })];
    await renderApp();

    await userEvent.click(screen.getByRole('button', { name: 'Delete task Delete me' }));
    const dialog = await screen.findByRole('dialog', { name: 'Delete task?' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(screen.queryByText('Delete me')).not.toBeInTheDocument());
  });

  it('keeps the task when deletion is cancelled', async () => {
    tasks = [makeTask({ title: 'Keep me' })];
    await renderApp();

    await userEvent.click(screen.getByRole('button', { name: 'Delete task Keep me' }));
    const dialog = await screen.findByRole('dialog', { name: 'Delete task?' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    expect(screen.getByText('Keep me')).toBeInTheDocument();
  });

  it('sorts active tasks by due date before completed tasks', async () => {
    tasks = [
      makeTask({ title: 'Completed early', dueDate: '2099-01-01', completed: true }),
      makeTask({ title: 'No date' }),
      makeTask({ title: 'Later', dueDate: '2099-03-01' }),
      makeTask({ title: 'Sooner', dueDate: '2099-02-01' }),
    ];

    await renderApp();

    expect(getTaskTitles()).toEqual(['Sooner', 'Later', 'No date', 'Completed early']);
  });

  it('filters tasks by status', async () => {
    tasks = [makeTask({ title: 'Active one' }), makeTask({ title: 'Done one', completed: true })];
    await renderApp();

    await userEvent.click(screen.getByRole('button', { name: 'Completed' }));
    expect(screen.queryByText('Active one')).not.toBeInTheDocument();
    expect(screen.getByText('Done one')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Active' }));
    expect(screen.getByText('Active one')).toBeInTheDocument();
    expect(screen.queryByText('Done one')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'All' }));
    expect(screen.getByText('Active one')).toBeInTheDocument();
    expect(screen.getByText('Done one')).toBeInTheDocument();
  });

  it('shows a filter-specific empty message', async () => {
    tasks = [makeTask({ title: 'Active one' })];
    await renderApp();

    await userEvent.click(screen.getByRole('button', { name: 'Completed' }));

    expect(screen.getByText('No tasks match this filter.')).toBeInTheDocument();
  });
});
