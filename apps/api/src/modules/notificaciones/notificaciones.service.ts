import { Inject, Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../auth';
import {
  NOTIFICACIONES_REPOSITORY,
  NotificacionesRepositoryPort,
} from './notificaciones.repository.port';
import { buildFallbackNotifications } from './domain/notificaciones-fallback';

@Injectable()
export class NotificacionesService {
  constructor(
    @Inject(NOTIFICACIONES_REPOSITORY)
    private readonly notificacionesRepository: NotificacionesRepositoryPort,
  ) {}

  async findByUsuario(user: AuthenticatedUser, take = 20) {
    const limit = Math.min(50, Math.max(1, Math.floor(take)));

    const [persisted, unreadCount] = await Promise.all([
      this.notificacionesRepository.findByUsuarioId(user.id, limit),
      this.notificacionesRepository.countUnreadByUsuarioId(user.id),
    ]);

    if (persisted.length > 0) {
      return {
        data: persisted.map((item) => ({
          id: item.id,
          tipo: item.tipo,
          titulo: item.titulo,
          mensaje: item.mensaje,
          recursoTipo: item.recursoTipo,
          recursoId: item.recursoId,
          leida: item.leida,
          createdAt: item.createdAt.toISOString(),
          readOnly: false,
          source: 'persisted' as const,
        })),
        unreadCount,
      };
    }

    const auditFallback =
      await this.notificacionesRepository.findAuditFallbackByUsuarioId(
        user.id,
        limit,
      );

    return {
      data: buildFallbackNotifications(auditFallback),
      unreadCount,
    };
  }

  async markAsRead(user: AuthenticatedUser, id: string) {
    await this.notificacionesRepository.markAsRead(user.id, id);

    return {
      unreadCount: await this.notificacionesRepository.countUnreadByUsuarioId(
        user.id,
      ),
    };
  }
}
