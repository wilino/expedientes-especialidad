import { ExpedienteDetailItem } from './expedientes.repository.port';

export const EXPEDIENTES_LOOKUP = Symbol('EXPEDIENTES_LOOKUP');

export interface ExpedientesLookupPort {
  findByIdOrThrow(id: string): Promise<ExpedienteDetailItem>;
}
