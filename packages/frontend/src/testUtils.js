import React from 'react';
import { render } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Ripples update state on timers, which causes act() warnings in tests.
const testTheme = createTheme({
  components: { MuiButtonBase: { defaultProps: { disableRipple: true } } },
});

export function renderWithTheme(ui) {
  return render(<ThemeProvider theme={testTheme}>{ui}</ThemeProvider>);
}
