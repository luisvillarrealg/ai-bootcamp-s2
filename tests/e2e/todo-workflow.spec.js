const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');
const { deleteAllTasks, getTasks } = require('./helpers/api');

test.describe('Todo workflow', () => {
  let todoPage;

  test.beforeEach(async ({ page, request }) => {
    await deleteAllTasks(request);
    todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  test.afterEach(async ({ request }) => {
    await deleteAllTasks(request);
  });

  test('adds a task with a description, due date, and priority', async ({ page, request }) => {
    await todoPage.addTask({
      title: 'Write report',
      description: 'Quarterly numbers',
      dueDate: '2099-05-20',
      priority: 'High',
    });

    const item = todoPage.taskItem('Write report');
    await expect(item).toBeVisible();
    await expect(item).toContainText('Quarterly numbers');
    await expect(item).toContainText('High priority');
    await expect(item).toContainText('Due May 20, 2099');
    await expect(todoPage.notice).toHaveText('Task added');
    await expect(page.getByText('No tasks yet.')).toBeHidden();

    expect(await getTasks(request)).toMatchObject([
      {
        title: 'Write report',
        description: 'Quarterly numbers',
        dueDate: '2099-05-20',
        priority: 'high',
        completed: false,
      },
    ]);

    await page.reload();
    await expect(todoPage.taskItem('Write report')).toContainText('Due May 20, 2099');
  });

  test('shows a validation error when the title is empty', async ({ request }) => {
    await todoPage.addTask({ title: '   ' });

    await expect(todoPage.addSection.getByText('Title is required')).toBeVisible();
    await expect(todoPage.taskTitles).toHaveCount(0);
    expect(await getTasks(request)).toEqual([]);
  });

  test('completes and reopens a task', async ({ request }) => {
    await todoPage.addTask({ title: 'Toggle me' });
    const checkbox = todoPage.taskItem('Toggle me').getByRole('checkbox');

    await todoPage.toggleTask('Toggle me');
    await expect(checkbox).toBeChecked();
    expect((await getTasks(request))[0].completed).toBe(true);

    await todoPage.toggleTask('Toggle me');
    await expect(checkbox).not.toBeChecked();
    expect((await getTasks(request))[0].completed).toBe(false);
  });
});
