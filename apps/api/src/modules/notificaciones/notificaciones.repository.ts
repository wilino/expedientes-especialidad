import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import {
  NotificacionesRepositoryPort,
  NotificacionAuditFallbackItem,
} from './notificaciones.repository.port';

@Injectable()
export class NotificacionesRepository implements NotificacionesRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findByUsuarioId(usuarioId: string, take: number) {
    return this.prisma.notificacion.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  async countUnreadByUsuarioId(usuarioId: string): Promise<number> {
    return this.prisma.notificacion.count({
      where: {
        usuarioId,
        leida: false,
      },
    });
  }

  async markAsRead(usuarioId: string, id: string): Promise<boolean> {
    const result = await this.prisma.notificacion.updateMany({
      where: {
        id,
        usuarioId,
        leida: false,
      },
      data: {
        leida: true,
      },
    });

    return result.count > 0;
  }

  async findAuditFallbackByUsuarioId(
    usuarioId: string,
    take: number,
  ): Promise<NotificacionAuditFallbackItem[]> {
    return this.prisma.auditLog.findMany({
      where: {
        usuarioId,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take,
      select: {
        id: true,
        accion: true,
        recurso: true,
        resultado: true,
        timestamp: true,
      },
    });
  }
}
