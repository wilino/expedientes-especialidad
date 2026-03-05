import { Component, type ErrorInfo, type PropsWithChildren } from 'react';
import { Alert, Box, Button, Stack, Typography } from '@mui/material';

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<
  PropsWithChildren,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Unhandled render error', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            p: 2,
          }}
        >
          <Stack spacing={2} sx={{ width: '100%', maxWidth: 520 }}>
            <Typography variant="h4" component="h1">
              Ocurrio un error inesperado
            </Typography>
            <Alert severity="error">
              La aplicacion encontro un problema de renderizado y debe recargar.
            </Alert>
            <Button variant="contained" onClick={this.handleReload}>
              Recargar aplicacion
            </Button>
          </Stack>
        </Box>
      );
    }

    return this.props.children;
  }
}
