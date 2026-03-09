import type { ThemeOptions } from '@mui/material/styles';

export const typography: NonNullable<ThemeOptions['typography']> = {
  fontFamily: '"Inter", sans-serif',
  h1: {
    fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
    fontWeight: 800,
    fontSize: '2.35rem',
  },
  h2: {
    fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
    fontWeight: 800,
    fontSize: '1.9rem',
  },
  h3: {
    fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
    fontWeight: 700,
    fontSize: '1.35rem',
  },
  h4: {
    fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
    fontWeight: 700,
    fontSize: '1.6rem',
  },
  h5: {
    fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
    fontWeight: 700,
  },
  h6: {
    fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
    fontWeight: 700,
  },
  subtitle1: {
    fontWeight: 600,
  },
  button: {
    textTransform: 'none',
    fontWeight: 600,
  },
};
