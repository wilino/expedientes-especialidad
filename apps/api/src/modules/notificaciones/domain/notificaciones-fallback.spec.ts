import { NotificacionTipo } from '@prisma/client';
import { buildFallbackNotifications } from './notificaciones-fallback';

describe('buildFallbackNotifications', () => {
  it('maps audit events into readonly fallback notifications', () => {
    const result = buildFallbackNotifications([
      {
        id: 'a1',
        accion: 'EXPEDIENTE_UPDATE',
        recurso: 'Expediente #1001',
        resultado: 'EXITO',
        timestamp: new Date('2026-03-09T14:00:00.000Z'),
      },
      {
        id: 'a2',
        accion: 'LOGIN',
        recurso: 'Auth',
        resultado: 'DENEGADO',
        timestamp: new Date('2026-03-09T14:10:00.000Z'),
      },
    ]);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: 'fallback-a1',
      tipo: NotificacionTipo.EXITO,
      readOnly: true,
      source: 'fallback',
    });
    expect(result[1].tipo).toBe(NotificacionTipo.ALERTA);
  });
});
