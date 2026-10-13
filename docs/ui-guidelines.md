# UI Guidelines

Core UI rules for the TODO app frontend (React).

## Components

- Use Material UI (`@mui/material`) components for all standard UI elements (buttons, inputs, checkboxes, dialogs, lists, date pickers, snackbars).
- Do not build custom versions of components that Material UI already provides.
- Use Material icons (`@mui/icons-material`) for all icons.
- Keep custom CSS to layout and small adjustments; prefer the MUI `sx` prop or theme overrides.

## Color Palette

Define colors once in the MUI theme; do not hard-code hex values in components.

| Role | Color | Usage |
|------|-------|-------|
| Primary | `#1976d2` | Primary actions, links, focus states |
| Secondary | `#9c27b0` | Secondary accents |
| Error | `#d32f2f` | Validation errors, delete actions, overdue tasks |
| Warning | `#ed6c02` | Tasks due soon |
| Success | `#2e7d32` | Completed tasks, success messages |
| Background | `#fafafa` | Page background |
| Surface | `#ffffff` | Cards and list items |
| Text primary | `rgba(0, 0, 0, 0.87)` | Body text |
| Text secondary | `rgba(0, 0, 0, 0.6)` | Descriptions, hints |

Priority indicators: high uses error, medium uses warning, low uses success. Never rely on color alone to convey meaning (see Accessibility).

## Typography

- Use the Roboto font (Material default) with the MUI typography scale.
- Page title: `h4`; section titles: `h6`; task titles: `body1`; descriptions and metadata: `body2`.
- Completed task titles use strikethrough and secondary text color.

## Buttons

- Primary action (e.g., "Add task", "Save"): `contained` variant, primary color. Only one primary button per view or dialog.
- Secondary action (e.g., "Cancel"): `text` or `outlined` variant.
- Destructive action (e.g., "Delete"): error color; confirm before deleting.
- Icon-only buttons (edit, delete) use `IconButton` and must have an `aria-label`.
- Button labels use sentence case and start with a verb.

## Layout and Spacing

- Use an 8px spacing grid (MUI `theme.spacing`).
- Center content in a `Container` with `maxWidth="sm"`.
- Mobile-first: layout must work from 320px wide and up; touch targets are at least 44x44px.
- Each task is displayed as a row or card showing title, due date, priority, and actions.

## Forms and Feedback

- Every input has a visible label; do not use placeholder text as a label.
- Show validation errors inline beneath the field using the `helperText` and `error` props.
- Show transient feedback (task added, updated, deleted, or request failed) with a `Snackbar`.
- Show an empty-state message with a prompt to add the first task when the list is empty.
- Show a loading indicator while data is being fetched.

## Accessibility

- Meet WCAG 2.1 AA: text contrast of at least 4.5:1, and 3:1 for large text and UI components.
- All functionality must be usable with the keyboard alone, with a visible focus indicator.
- Use semantic HTML and correct ARIA attributes; do not remove default focus outlines.
- Convey status (overdue, completed, priority) with text or icons in addition to color.
- Associate form labels with inputs, and announce errors and snackbar messages to screen readers (`role="alert"` or `aria-live`).
- Respect the `prefers-reduced-motion` setting.
- Provide `data-testid` attributes on key interactive elements to support testing.
