import { Alert, Box, Skeleton, Stack, Typography } from '@mui/material';
import type { DashboardGauge } from '../types';
import { GaugeCard } from './gauge-card';

interface GaugePanelProps {
  gauges: DashboardGauge[];
  loading: boolean;
  error: string | null;
}

const gaugeColorByKey: Record<string, string> = {
  resolutionRate: '#C8A951',
  deadlineCompliance: '#22A96B',
  documentIntegrity: '#4A90D9',
  auditCoverage: '#1B2A4A',
};

export function GaugePanel({ gauges, loading, error }: GaugePanelProps) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="h6" fontWeight={800}>
        Métricas operativas
      </Typography>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
          gap: 1.2,
        }}
      >
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                variant="rounded"
                animation="wave"
                sx={{ borderRadius: 2, height: 210 }}
              />
            ))
          : gauges.map((gauge) => (
              <GaugeCard
                key={gauge.key}
                gauge={gauge}
                color={gaugeColorByKey[gauge.key] ?? '#1B2A4A'}
              />
            ))}
      </Box>
    </Stack>
  );
}
