import { render, screen } from '@testing-library/react';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import { describe, expect, it } from 'vitest';
import { StatCard } from './stat-card';

describe('StatCard', () => {
  it('renders KPI value and trend badge', () => {
    render(
      <StatCard
        icon={<DescriptionRoundedIcon fontSize="small" />}
        label="Documentos"
        value={256}
        trendPercent={12}
        trendDirection="up"
      />,
    );

    expect(screen.getByText('Documentos')).toBeInTheDocument();
    expect(screen.getByText('256')).toBeInTheDocument();
    expect(screen.getByText('+12%')).toBeInTheDocument();
  });
});
