import { NotificacionTipo } from '@prisma/client';

export interface AuditFallbackSource {
  id: string;
  accion: string;
  recurso: string;
  resultado: string;
  timestamp: Date;
}

export interface FallbackNotificationItem {
  id: string;
  tipo: NotificacionTipo;
  titulo: string;
  mensaje: string;
  recursoTipo: null;
  recursoId: null;
  leida: false;
  createdAt: string;
  readOnly: true;
  source: 'fallback';
}

export function buildFallbackNotifications(
  logs: AuditFallbackSource[],
): FallbackNotificationItem[] {
  return logs.map((log) => ({
    id: `fallback-${log.id}`,
    tipo: resolveTipo(log.resultado),
    titulo: `${log.accion} (${log.resultado})`,
    mensaje: log.recurso,
    recursoTipo: null,
    recursoId: null,
    leida: false,
    createdAt: log.timestamp.toISOString(),
    readOnly: true,
    source: 'fallback',
  }));
}

function resolveTipo(resultado: string): NotificacionTipo {
  if (resultado === 'EXITO') {
    return NotificacionTipo.EXITO;
  }

  if (resultado === 'ERROR' || resultado === 'DENEGADO') {
    return NotificacionTipo.ALERTA;
  }

  return NotificacionTipo.INFO;
}
