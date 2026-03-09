import { Notificacion, RecursoTipo, NotificacionTipo } from '@prisma/client';

export const NOTIFICACIONES_REPOSITORY = Symbol('NOTIFICACIONES_REPOSITORY');

export interface NotificacionItem extends Notificacion {
  recursoTipo: RecursoTipo | null;
  tipo: NotificacionTipo;
}

export interface NotificacionAuditFallbackItem {
  id: string;
  accion: string;
  recurso: string;
  resultado: string;
  timestamp: Date;
}

export interface NotificacionesRepositoryPort {
  findByUsuarioId(usuarioId: string, take: number): Promise<NotificacionItem[]>;
  countUnreadByUsuarioId(usuarioId: string): Promise<number>;
  markAsRead(usuarioId: string, id: string): Promise<boolean>;
  findAuditFallbackByUsuarioId(
    usuarioId: string,
    take: number,
  ): Promise<NotificacionAuditFallbackItem[]>;
}
