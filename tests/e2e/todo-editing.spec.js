const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');
const { deleteAllTasks, createTask } = require('./helpers/api');

test.describe('Todo editing and deleting', () => {
  let todoPage;

  test.beforeEach(async ({ page, request }) => {
    await deleteAllTasks(request);
    await createTask(request, { title: 'Original title', priority: 'low' });
    todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  test.afterEach(async ({ request }) => {
    await deleteAllTasks(request);
  });

  test('edits the title, due date, and priority of a task', async () => {
    await todoPage.editTask('Original title', {
      title: 'Edited title',
      dueDate: '2099-12-31',
      priority: 'High',
    });

    const item = todoPage.taskItem('Edited title');
    await expect(item).toBeVisible();
    await expect(item).toContainText('Due Dec 31, 2099');
    await expect(item).toContainText('High priority');
    await expect(todoPage.taskItem('Original title')).toHaveCount(0);
  });

  test('keeps the task when deletion is cancelled and removes it when confirmed', async () => {
    await todoPage.deleteTask('Original title', { confirm: false });
    await expect(todoPage.taskItem('Original title')).toBeVisible();

    await todoPage.deleteTask('Original title');
    await expect(todoPage.taskItem('Original title')).toHaveCount(0);
    await expect(todoPage.notice).toHaveText('Task deleted');
  });
});
