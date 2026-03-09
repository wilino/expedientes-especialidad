import { EstadoExpediente } from '@prisma/client';

export const DASHBOARD_REPOSITORY = Symbol('DASHBOARD_REPOSITORY');

export interface DateRange {
  from: Date;
  to: Date;
}

export interface DashboardRepositoryPort {
  getExpedientesCount(range?: DateRange): Promise<number>;
  getActuacionesCount(range?: DateRange): Promise<number>;
  getDocumentosCount(range?: DateRange): Promise<number>;
  getAuditoriaCount(range?: DateRange): Promise<number>;
  getExpedientesByEstado(): Promise<
    Array<{
      estado: EstadoExpediente;
      total: number;
    }>
  >;
  getExpedientesResolvedCount(): Promise<number>;
  getExpedientesWithDocumentsCount(): Promise<number>;
  getRecordatoriosOverdueStats(
    usuarioId: string,
    until: Date,
  ): Promise<{ total: number; completados: number }>;
  getRecordatoriosTodayCount(
    usuarioId: string,
    from: Date,
    to: Date,
  ): Promise<number>;
  getUnreadNotificationsCount(usuarioId: string): Promise<number>;
}
