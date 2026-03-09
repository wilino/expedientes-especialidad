import { Prisma, Recordatorio } from '@prisma/client';

export const RECORDATORIOS_REPOSITORY = Symbol('RECORDATORIOS_REPOSITORY');

export interface FindRecordatoriosParams {
  usuarioId: string;
  from?: Date;
  to?: Date;
  take: number;
}

export interface RecordatoriosRepositoryPort {
  findByUsuario(params: FindRecordatoriosParams): Promise<Recordatorio[]>;
  create(data: Prisma.RecordatorioUncheckedCreateInput): Promise<Recordatorio>;
  updateByIdForUsuario(
    id: string,
    usuarioId: string,
    data: Prisma.RecordatorioUpdateInput,
  ): Promise<Recordatorio | null>;
}
