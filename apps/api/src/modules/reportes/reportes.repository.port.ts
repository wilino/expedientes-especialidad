import { EstadoExpediente } from '@prisma/client';

export const REPORTES_REPOSITORY = Symbol('REPORTES_REPOSITORY');

export interface ReporteEstadosResult {
  totalExpedientes: number;
  porEstado: Array<{
    estado: EstadoExpediente;
    total: number;
  }>;
}

export interface ReporteActividadParams {
  desde?: Date;
  hasta?: Date;
}

export interface ReporteActividadResult {
  periodo: {
    desde: string | null;
    hasta: string | null;
  };
  totales: {
    expedientesCreados: number;
    actuacionesRegistradas: number;
    documentosSubidos: number;
    eventosAuditoria: number;
  };
  eventosPorResultado: Array<{
    resultado: string;
    total: number;
  }>;
}

export interface ReportesRepositoryPort {
  getEstados(): Promise<ReporteEstadosResult>;
  getActividad(params: ReporteActividadParams): Promise<ReporteActividadResult>;
}
