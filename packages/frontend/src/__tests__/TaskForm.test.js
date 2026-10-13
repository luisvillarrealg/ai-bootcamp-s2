import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskForm from '../components/TaskForm';
import { renderWithTheme as render } from '../testUtils';

describe('TaskForm', () => {
  it('shows a validation error and does not submit when the title is empty', async () => {
    const onSubmit = jest.fn();
    render(<TaskForm submitLabel="Add task" onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: 'Add task' }));

    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows an error for titles that are too long', async () => {
    const onSubmit = jest.fn();
    render(<TaskForm submitLabel="Add task" onSubmit={onSubmit} />);

    await userEvent.click(screen.getByLabelText(/Title/));
    await userEvent.paste('a'.repeat(201));
    await userEvent.click(screen.getByRole('button', { name: 'Add task' }));

    expect(screen.getByText('Title must be 200 characters or fewer')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits trimmed values including the due date', async () => {
    const onSubmit = jest.fn().mockResolvedValue(true);
    render(<TaskForm submitLabel="Add task" onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/Title/), '  Buy milk  ');
    await userEvent.type(screen.getByLabelText('Description'), 'Two litres');
    await userEvent.type(screen.getByLabelText('Due date'), '2030-05-20');
    await userEvent.click(screen.getByRole('button', { name: 'Add task' }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Buy milk',
      description: 'Two litres',
      dueDate: '2030-05-20',
      priority: 'medium',
    });
  });

  it('allows choosing a priority', async () => {
    const onSubmit = jest.fn().mockResolvedValue(true);
    render(<TaskForm submitLabel="Add task" onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/Title/), 'Urgent');
    await userEvent.click(screen.getByRole('combobox', { name: 'Priority' }));
    await userEvent.click(screen.getByRole('option', { name: 'High' }));
    await userEvent.click(screen.getByRole('button', { name: 'Add task' }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ priority: 'high' }));
  });

  it('clears the form after a successful submit when resetOnSuccess is set', async () => {
    const onSubmit = jest.fn().mockResolvedValue(true);
    render(<TaskForm submitLabel="Add task" onSubmit={onSubmit} resetOnSuccess />);

    await userEvent.type(screen.getByLabelText(/Title/), 'Buy milk');
    await userEvent.click(screen.getByRole('button', { name: 'Add task' }));

    await waitFor(() => expect(screen.getByLabelText(/Title/)).toHaveValue(''));
  });

  it('keeps the entered values when the submit fails', async () => {
    const onSubmit = jest.fn().mockResolvedValue(false);
    render(<TaskForm submitLabel="Add task" onSubmit={onSubmit} resetOnSuccess />);

    await userEvent.type(screen.getByLabelText(/Title/), 'Buy milk');
    await userEvent.click(screen.getByRole('button', { name: 'Add task' }));

    expect(screen.getByLabelText(/Title/)).toHaveValue('Buy milk');
  });

  it('prefills initial values and calls onCancel', async () => {
    const onCancel = jest.fn();
    render(
      <TaskForm
        submitLabel="Save changes"
        initialValues={{ title: 'Existing', description: 'Desc', dueDate: '2030-01-02', priority: 'low' }}
        onSubmit={jest.fn()}
        onCancel={onCancel}
      />
    );

    expect(screen.getByLabelText(/Title/)).toHaveValue('Existing');
    expect(screen.getByLabelText('Due date')).toHaveValue('2030-01-02');

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalled();
  });
});
