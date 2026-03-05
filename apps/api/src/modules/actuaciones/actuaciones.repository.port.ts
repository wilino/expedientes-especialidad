import { Prisma, Actuacion } from '@prisma/client';

export const ACTUACIONES_REPOSITORY = Symbol('ACTUACIONES_REPOSITORY');

export type ActuacionListItem = Prisma.ActuacionGetPayload<{
  include: {
    usuario: {
      select: {
        id: true;
        nombre: true;
      };
    };
  };
}>;

export interface ActuacionesRepositoryPort {
  create(data: Prisma.ActuacionUncheckedCreateInput): Promise<Actuacion>;
  findByIdAndExpediente(
    id: string,
    expedienteId: string,
  ): Promise<Actuacion | null>;
  findByExpedienteId(
    expedienteId: string,
    params?: { skip?: number; take?: number },
  ): Promise<{ data: ActuacionListItem[]; total: number }>;
  update(id: string, data: Prisma.ActuacionUpdateInput): Promise<Actuacion>;
  remove(id: string): Promise<void>;
}
