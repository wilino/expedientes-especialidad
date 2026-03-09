import { Card, Stack, Typography } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import type { DashboardEstadoSlice } from '../types';

interface ExpedienteDonutChartProps {
  data: DashboardEstadoSlice[];
  loading: boolean;
}

const estadoColorMap: Record<string, string> = {
  ABIERTO: '#4A90D9',
  EN_TRAMITE: '#C8A951',
  CERRADO: '#22A96B',
  ARCHIVADO: '#6B7280',
};

const estadoLabelMap: Record<string, string> = {
  ABIERTO: 'Abierto',
  EN_TRAMITE: 'En trámite',
  CERRADO: 'Cerrado',
  ARCHIVADO: 'Archivado',
};

export function ExpedienteDonutChart({ data, loading }: ExpedienteDonutChartProps) {
  if (!loading && data.length === 0) {
    return (
      <Card sx={{ p: 2.5 }}>
        <Typography variant="h6" fontWeight={800}>
          Expedientes por estado
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Sin datos para mostrar.
        </Typography>
      </Card>
    );
  }

  const seriesData = data.map((item) => ({
    value: item.total,
    label: estadoLabelMap[item.estado] ?? item.estado,
    color: estadoColorMap[item.estado] ?? '#1B2A4A',
  }));

  return (
    <Card sx={{ p: 2.5 }}>
      <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
        Expedientes por estado
      </Typography>

      {loading ? (
        <Typography variant="body2" color="text.secondary">
          Cargando gráfico...
        </Typography>
      ) : (
        <Stack sx={{ overflowX: 'auto' }}>
          <PieChart
            series={[
              {
                data: seriesData,
                innerRadius: 56,
                outerRadius: 90,
                cornerRadius: 5,
                paddingAngle: 2,
              },
            ]}
            height={240}
            width={420}
          />
        </Stack>
      )}
    </Card>
  );
}
