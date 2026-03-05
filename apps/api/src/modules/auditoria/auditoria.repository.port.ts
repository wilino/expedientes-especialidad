import { AuditLog, Prisma } from '@prisma/client';

export const AUDITORIA_REPOSITORY = Symbol('AUDITORIA_REPOSITORY');

export interface FindAuditoriaParams {
  skip?: number;
  take?: number;
  usuarioId?: string;
  expedienteId?: string;
  accion?: string;
  resultado?: string;
  desde?: Date;
  hasta?: Date;
}

export type AuditLogListItem = Prisma.AuditLogGetPayload<{
  include: {
    usuario: {
      select: {
        id: true;
        nombre: true;
        correo: true;
      };
    };
    expediente: {
      select: {
        id: true;
        codigo: true;
      };
    };
  };
}>;

export interface AuditoriaRepositoryPort {
  create(data: Prisma.AuditLogUncheckedCreateInput): Promise<AuditLog>;
  findAll(
    params: FindAuditoriaParams,
  ): Promise<{ data: AuditLogListItem[]; total: number }>;
}
