import type { ThemeOptions } from '@mui/material/styles';

export const typography: NonNullable<ThemeOptions['typography']> = {
  fontFamily: '"IBM Plex Sans", sans-serif',
  h1: {
    fontFamily: '"Fraunces", serif',
    fontWeight: 600,
    fontSize: '2.2rem',
  },
  h2: {
    fontFamily: '"Fraunces", serif',
    fontWeight: 600,
    fontSize: '1.8rem',
  },
  h3: {
    fontFamily: '"Fraunces", serif',
    fontWeight: 600,
    fontSize: '1.25rem',
  },
  subtitle1: {
    fontWeight: 600,
  },
  button: {
    textTransform: 'none',
    fontWeight: 600,
  },
};
