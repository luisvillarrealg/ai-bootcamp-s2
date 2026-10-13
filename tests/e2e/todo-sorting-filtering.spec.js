const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');
const { deleteAllTasks, createTask } = require('./helpers/api');

test.describe('Todo sorting and filtering', () => {
  let todoPage;

  test.beforeEach(async ({ page, request }) => {
    await deleteAllTasks(request);
    await createTask(request, { title: 'Done task', dueDate: '2099-01-01', completed: true });
    await createTask(request, { title: 'No date task' });
    await createTask(request, { title: 'Later task', dueDate: '2099-03-01' });
    await createTask(request, { title: 'Sooner task', dueDate: '2099-02-01' });
    todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  test.afterEach(async ({ request }) => {
    await deleteAllTasks(request);
  });

  test('sorts active tasks by due date, with undated and completed tasks last', async () => {
    await expect(todoPage.taskTitles).toHaveText([
      'Sooner task',
      'Later task',
      'No date task',
      'Done task',
    ]);
  });

  test('filters tasks by status', async () => {
    await todoPage.filterBy('Completed');
    await expect(todoPage.taskTitles).toHaveText(['Done task']);

    await todoPage.filterBy('Active');
    await expect(todoPage.taskTitles).toHaveText(['Sooner task', 'Later task', 'No date task']);

    await todoPage.filterBy('All');
    await expect(todoPage.taskTitles).toHaveCount(4);
  });

  test('marks active tasks that are past their due date as overdue', async ({ request }) => {
    await createTask(request, { title: 'Late task', dueDate: '2000-01-01' });
    await todoPage.goto();

    await expect(todoPage.taskItem('Late task')).toContainText('Overdue');
    await expect(todoPage.taskItem('Sooner task')).not.toContainText('Overdue');
  });
});
