class TodoPage {
  constructor(page) {
    this.page = page;
    this.addSection = page.getByRole('region', { name: 'Add task' });
    this.editDialog = page.getByRole('dialog', { name: 'Edit task' });
    this.deleteDialog = page.getByRole('dialog', { name: 'Delete task?' });
    this.taskTitles = page.getByTestId('task-title');
    this.notice = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/');
    await this.page.getByRole('heading', { name: 'To Do App' }).waitFor();
  }

  async fillTaskForm(form, { title, description, dueDate, priority }) {
    if (title !== undefined) await form.getByLabel('Title').fill(title);
    if (description !== undefined) await form.getByLabel('Description').fill(description);
    if (dueDate !== undefined) await form.getByLabel('Due date').fill(dueDate);
    if (priority !== undefined) {
      await form.getByRole('combobox', { name: 'Priority' }).click();
      await this.page.getByRole('option', { name: priority, exact: true }).click();
    }
  }

  async addTask(task) {
    await this.fillTaskForm(this.addSection, task);
    await this.addSection.getByRole('button', { name: 'Add task' }).click();
  }

  taskItem(title) {
    return this.page.getByTestId('task-item').filter({ hasText: title });
  }

  async toggleTask(title) {
    await this.taskItem(title).getByRole('checkbox').click();
  }

  async editTask(title, changes) {
    await this.taskItem(title).getByRole('button', { name: `Edit task ${title}` }).click();
    await this.fillTaskForm(this.editDialog, changes);
    await this.editDialog.getByRole('button', { name: 'Save changes' }).click();
  }

  async deleteTask(title, { confirm = true } = {}) {
    await this.taskItem(title).getByRole('button', { name: `Delete task ${title}` }).click();
    await this.deleteDialog.getByRole('button', { name: confirm ? 'Delete' : 'Cancel' }).click();
  }

  async filterBy(name) {
    await this.page.getByRole('group', { name: 'Filter tasks by status' }).getByRole('button', { name }).click();
  }
}

module.exports = { TodoPage };
