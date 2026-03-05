import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { components } from './components';
import { palette } from './palette';
import { typography } from './typography';

export function createAppTheme() {
  const baseTheme = createTheme({
    palette,
    typography,
    shape: {
      borderRadius: 10,
    },
    spacing: 8,
    components,
  });

  return responsiveFontSizes(baseTheme);
}

export const appTheme = createAppTheme();
