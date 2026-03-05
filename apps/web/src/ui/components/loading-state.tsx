import { CircularProgress, Stack, Typography } from '@mui/material';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Cargando...' }: LoadingStateProps) {
  return (
    <Stack
      spacing={1}
      direction="row"
      alignItems="center"
      sx={{ py: 1, color: 'text.secondary' }}
    >
      <CircularProgress size={18} />
      <Typography variant="body2">{message}</Typography>
    </Stack>
  );
}
