const { validateTaskInput, MAX_TITLE_LENGTH } = require('../src/taskValidation');

describe('validateTaskInput', () => {
  it('accepts a minimal valid task and trims the title', () => {
    const { errors, values } = validateTaskInput({ title: '  Buy milk  ' });

    expect(errors).toEqual([]);
    expect(values).toEqual({ title: 'Buy milk' });
  });

  it('accepts all supported fields', () => {
    const { errors, values } = validateTaskInput({
      title: 'Write report',
      description: 'Quarterly numbers',
      dueDate: '2030-05-20',
      priority: 'high',
      completed: true,
    });

    expect(errors).toEqual([]);
    expect(values).toEqual({
      title: 'Write report',
      description: 'Quarterly numbers',
      dueDate: '2030-05-20',
      priority: 'high',
      completed: true,
    });
  });

  it.each([undefined, '', '   ', 42, null])('rejects title %p', (title) => {
    const { errors } = validateTaskInput({ title });

    expect(errors).toContain('Title is required');
  });

  it('rejects a body that is not an object', () => {
    expect(validateTaskInput(undefined).errors).toContain('Title is required');
  });

  it('rejects titles longer than the maximum length', () => {
    const { errors } = validateTaskInput({ title: 'a'.repeat(MAX_TITLE_LENGTH + 1) });

    expect(errors).toEqual([`Title must be ${MAX_TITLE_LENGTH} characters or fewer`]);
  });

  it('rejects invalid descriptions', () => {
    expect(validateTaskInput({ title: 'A', description: 5 }).errors).toEqual([
      'Description must be a string',
    ]);
    expect(validateTaskInput({ title: 'A', description: 'x'.repeat(1001) }).errors).toHaveLength(1);
  });

  it.each(['2030-02-30', 'tomorrow', '2030/01/01', '01-01-2030', 20300101])(
    'rejects invalid due date %p',
    (dueDate) => {
      const { errors } = validateTaskInput({ title: 'A', dueDate });

      expect(errors).toEqual(['Due date must be a valid date in YYYY-MM-DD format']);
    }
  );

  it.each([null, ''])('treats due date %p as removing the date', (dueDate) => {
    const { errors, values } = validateTaskInput({ title: 'A', dueDate });

    expect(errors).toEqual([]);
    expect(values.dueDate).toBeNull();
  });

  it('rejects an unknown priority', () => {
    const { errors } = validateTaskInput({ title: 'A', priority: 'urgent' });

    expect(errors).toEqual(['Priority must be one of: low, medium, high']);
  });

  it('rejects a non-boolean completed flag', () => {
    const { errors } = validateTaskInput({ title: 'A', completed: 'yes' });

    expect(errors).toEqual(['Completed must be a boolean']);
  });

  describe('partial validation', () => {
    it('does not require a title', () => {
      const { errors, values } = validateTaskInput({ completed: true }, { partial: true });

      expect(errors).toEqual([]);
      expect(values).toEqual({ completed: true });
    });

    it('still rejects an empty title when it is provided', () => {
      const { errors } = validateTaskInput({ title: ' ' }, { partial: true });

      expect(errors).toContain('Title is required');
    });
  });
});
