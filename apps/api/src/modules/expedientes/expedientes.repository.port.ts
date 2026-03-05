import { Prisma, Expediente, EstadoExpediente } from '@prisma/client';

export const EXPEDIENTES_REPOSITORY = Symbol('EXPEDIENTES_REPOSITORY');

export interface FindExpedientesParams {
  skip?: number;
  take?: number;
  estado?: EstadoExpediente;
  q?: string;
  desde?: Date;
  hasta?: Date;
}

export type ExpedienteListItem = Prisma.ExpedienteGetPayload<{
  include: {
    creador: {
      select: {
        id: true;
        nombre: true;
      };
    };
    _count: {
      select: {
        actuaciones: true;
        documentos: true;
      };
    };
  };
}>;

export type ExpedienteDetailItem = Prisma.ExpedienteGetPayload<{
  include: {
    creador: {
      select: {
        id: true;
        nombre: true;
        correo: true;
      };
    };
    _count: {
      select: {
        actuaciones: true;
        documentos: true;
      };
    };
  };
}>;

export interface ExpedientesRepositoryPort {
  create(data: Prisma.ExpedienteUncheckedCreateInput): Promise<Expediente>;
  findById(id: string): Promise<ExpedienteDetailItem | null>;
  findByCodigo(codigo: string): Promise<Expediente | null>;
  findAll(
    params: FindExpedientesParams,
  ): Promise<{ data: ExpedienteListItem[]; total: number }>;
  update(id: string, data: Prisma.ExpedienteUpdateInput): Promise<Expediente>;
  updateEstado(id: string, estado: EstadoExpediente): Promise<Expediente>;
  count(where?: Prisma.ExpedienteWhereInput): Promise<number>;
}
