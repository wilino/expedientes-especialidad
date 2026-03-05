import type { Components, Theme } from '@mui/material/styles';

export const components: Components<Omit<Theme, 'components'>> = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        background:
          'radial-gradient(circle at 8% 8%, #ffe2ce 0%, transparent 40%), radial-gradient(circle at 90% 12%, #f4e5c2 0%, transparent 35%), #f5f3ef',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        border: '1px solid #ddd5c8',
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
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
