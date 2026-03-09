import type { Components, Theme } from '@mui/material/styles';

export const components: Components<Omit<Theme, 'components'>> = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        background:
          'radial-gradient(circle at 10% 8%, rgba(74,144,217,0.09) 0%, transparent 40%), radial-gradient(circle at 88% 12%, rgba(200,169,81,0.08) 0%, transparent 36%), #F4F6FA',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        border: '1px solid #E2E6EF',
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 14,
        boxShadow: '0 4px 24px rgba(15, 27, 51, 0.06)',
      },
    },
  },
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: {
        borderRadius: 10,
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      size: 'small',
      fullWidth: true,
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: 10,
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      head: {
        fontWeight: 700,
      },
    },
  },
};
