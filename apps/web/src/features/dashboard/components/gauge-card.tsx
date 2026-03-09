import { Card, Stack, Typography } from '@mui/material';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import type { DashboardGauge } from '../types';

interface GaugeCardProps {
  gauge: DashboardGauge;
  color: string;
}

export function GaugeCard({ gauge, color }: GaugeCardProps) {
  return (
    <Card sx={{ p: 2.2, textAlign: 'center' }}>
      <Stack spacing={0.8} alignItems="center">
        <Gauge
          value={gauge.value}
          startAngle={-110}
          endAngle={110}
          innerRadius="72%"
          outerRadius="100%"
          width={170}
          height={120}
          text={({ value }) => `${Math.round(value ?? 0)}%`}
          sx={{
            [`& .${gaugeClasses.valueText}`]: {
              fontSize: 24,
              fontWeight: 700,
              transform: 'translate(0, 0)',
              fontFamily: '"DM Sans", "Inter", sans-serif',
            },
            [`& .${gaugeClasses.valueArc}`]: {
              fill: color,
            },
            [`& .${gaugeClasses.referenceArc}`]: {
              fill: '#E2E6EF',
            },
          }}
        />
        <Typography variant="body2" fontWeight={700}>
          {gauge.label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {gauge.numerator.toLocaleString()} / {gauge.denominator.toLocaleString()}
        </Typography>
      </Stack>
    </Card>
  );
}
