import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, eyebrow, actions }: PageHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', sm: 'center' }}
    >
      <Box>
        {eyebrow ? (
          <Typography
            variant="overline"
            color="primary.dark"
            fontWeight={700}
            letterSpacing={1}
          >
            {eyebrow}
          </Typography>
        ) : null}
        <Typography variant="h2">{title}</Typography>
        {subtitle ? (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {actions ? <Box>{actions}</Box> : null}
    </Stack>
  );
}
