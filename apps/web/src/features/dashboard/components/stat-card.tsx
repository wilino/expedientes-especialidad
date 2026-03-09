import type { ReactNode } from 'react';
import { Avatar, Card, Chip, Stack, Typography } from '@mui/material';
import type { DashboardTrendDirection } from '../../../lib/contracts';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: number;
  trendPercent: number;
  trendDirection: DashboardTrendDirection;
}

function getTrendColor(direction: DashboardTrendDirection): 'success' | 'error' | 'default' {
  if (direction === 'up') {
    return 'success';
  }

  if (direction === 'down') {
    return 'error';
  }

  return 'default';
}

function formatTrend(value: number): string {
  if (value > 0) {
    return `+${value}%`;
  }

  return `${value}%`;
}

export function StatCard({
  icon,
  label,
  value,
  trendPercent,
  trendDirection,
}: StatCardProps) {
  return (
    <Card
      sx={{
        p: 2.5,
        display: 'flex',
        alignItems: 'center',
        gap: 1.8,
        minHeight: 120,
        transition: 'transform 180ms ease, box-shadow 180ms ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 6,
        },
      }}
    >
      <Avatar
        sx={{
          width: 52,
          height: 52,
          background: 'linear-gradient(135deg, #1B2A4A 0%, #2E4068 100%)',
          color: 'common.white',
        }}
      >
        {icon}
      </Avatar>

      <Stack spacing={0.2}>
        <Typography
          variant="h4"
          sx={{
            fontFamily: '"DM Sans", "Inter", sans-serif',
            lineHeight: 1,
          }}
        >
          {value.toLocaleString()}
        </Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {label}
        </Typography>
      </Stack>

      <Chip
        label={formatTrend(trendPercent)}
        size="small"
        color={getTrendColor(trendDirection)}
        sx={{ ml: 'auto', fontWeight: 700 }}
      />
    </Card>
  );
}
