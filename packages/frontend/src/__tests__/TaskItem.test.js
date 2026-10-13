import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskItem from '../components/TaskItem';
import { renderWithTheme as render } from '../testUtils';

const baseTask = {
  id: 1,
  title: 'Write report',
  description: 'Quarterly numbers',
  dueDate: '2099-05-20',
  priority: 'high',
  completed: false,
  createdAt: '2030-01-01 00:00:00',
};

const renderItem = (task = {}, handlers = {}) =>
  render(
    <ul>
      <TaskItem
        task={{ ...baseTask, ...task }}
        onToggle={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        {...handlers}
      />
    </ul>
  );

describe('TaskItem', () => {
  it('shows the title, description, priority, and due date', () => {
    renderItem();

    expect(screen.getByText('Write report')).toBeInTheDocument();
    expect(screen.getByText('Quarterly numbers')).toBeInTheDocument();
    expect(screen.getByText('High priority')).toBeInTheDocument();
    expect(screen.getByText('Due May 20, 2099')).toBeInTheDocument();
    expect(screen.queryByText('Overdue')).not.toBeInTheDocument();
  });

  it('marks active tasks with a past due date as overdue', () => {
    renderItem({ dueDate: '2000-01-01' });

    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });

  it('does not mark completed tasks as overdue and strikes through the title', () => {
    renderItem({ dueDate: '2000-01-01', completed: true });

    expect(screen.queryByText('Overdue')).not.toBeInTheDocument();
    expect(screen.getByText('Write report')).toHaveStyle('text-decoration: line-through');
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('omits the due date chip when there is no due date', () => {
    renderItem({ dueDate: null });

    expect(screen.queryByText(/^Due /)).not.toBeInTheDocument();
  });

  it('calls the toggle, edit, and delete handlers with the task', async () => {
    const onToggle = jest.fn();
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    renderItem({}, { onToggle, onEdit, onDelete });

    await userEvent.click(screen.getByRole('checkbox', { name: 'Mark task Write report as completed' }));
    await userEvent.click(screen.getByRole('button', { name: 'Edit task Write report' }));
    await userEvent.click(screen.getByRole('button', { name: 'Delete task Write report' }));

    expect(onToggle).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
    expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });
});
