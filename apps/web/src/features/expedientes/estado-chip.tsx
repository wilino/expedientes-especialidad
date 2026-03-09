import { Chip, type ChipProps } from '@mui/material';
import type { EstadoExpediente } from '../../lib/contracts';

const ESTADO_CONFIG: Record<EstadoExpediente, { label: string; color: ChipProps['color'] }> = {
  ABIERTO: { label: 'Abierto', color: 'info' },
  EN_TRAMITE: { label: 'En trámite', color: 'warning' },
  CERRADO: { label: 'Cerrado', color: 'success' },
  ARCHIVADO: { label: 'Archivado', color: 'default' },
};

interface EstadoChipProps {
  estado: EstadoExpediente;
  size?: ChipProps['size'];
}

export function EstadoChip({ estado, size = 'small' }: EstadoChipProps) {
  const config = ESTADO_CONFIG[estado] ?? { label: estado, color: 'default' as const };
  return <Chip label={config.label} color={config.color} size={size} />;
}
