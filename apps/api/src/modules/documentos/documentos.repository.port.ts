import { Prisma, Documento } from '@prisma/client';

export const DOCUMENTOS_REPOSITORY = Symbol('DOCUMENTOS_REPOSITORY');

export type DocumentoListItem = Prisma.DocumentoGetPayload<{
  include: {
    usuario: {
      select: {
        id: true;
        nombre: true;
      };
    };
  };
}>;

export interface DocumentosRepositoryPort {
  create(data: Prisma.DocumentoUncheckedCreateInput): Promise<Documento>;
  findById(id: string): Promise<Documento | null>;
  findByIdAndExpediente(
    id: string,
    expedienteId: string,
  ): Promise<Documento | null>;
  findByExpedienteId(
    expedienteId: string,
    params?: { skip?: number; take?: number },
  ): Promise<{ data: DocumentoListItem[]; total: number }>;
}
