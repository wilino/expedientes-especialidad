export const ACTIVIDAD_REPOSITORY = Symbol('ACTIVIDAD_REPOSITORY');

export interface ActividadRecienteItem {
  id: string;
  accion: string;
  recurso: string;
  resultado: string;
  timestamp: Date;
  usuario: {
    id: string;
    nombre: string;
  } | null;
  expediente: {
    id: string;
    codigo: string;
  } | null;
}

export interface ActividadRepositoryPort {
  findRecent(limit: number): Promise<ActividadRecienteItem[]>;
}
