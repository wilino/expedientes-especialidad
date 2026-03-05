import type { ReactNode } from 'react';
import { Paper, Stack, Typography } from '@mui/material';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={1.5} alignItems="flex-start">
        <Typography variant="h6">{title}</Typography>
        {description ? (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        ) : null}
        {action ? action : null}
      </Stack>
    </Paper>
  );
}
