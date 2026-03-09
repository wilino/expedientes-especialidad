import { Inject, Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../auth';
import {
  buildDashboardPeriods,
  calculateTrendPercent,
  clampPercent,
  resolveTrendDirection,
  toPercent,
} from './domain/dashboard-metrics';
import {
  DASHBOARD_REPOSITORY,
  DashboardRepositoryPort,
} from './dashboard.repository.port';

@Injectable()
export class DashboardService {
  constructor(
    @Inject(DASHBOARD_REPOSITORY)
    private readonly dashboardRepository: DashboardRepositoryPort,
  ) {}

  async getSummary(user: AuthenticatedUser, windowDays = 30) {
    const now = new Date();
    const periods = buildDashboardPeriods(windowDays, now);

    const [
      totalExpedientes,
      totalActuaciones,
      totalDocumentos,
      totalAuditoria,
      currentExpedientes,
      previousExpedientes,
      currentActuaciones,
      previousActuaciones,
      currentDocumentos,
      previousDocumentos,
      currentAuditoria,
      previousAuditoria,
      remindersToday,
      unreadNotifications,
      expedientesByEstado,
    ] = await Promise.all([
      this.dashboardRepository.getExpedientesCount(),
      this.dashboardRepository.getActuacionesCount(),
      this.dashboardRepository.getDocumentosCount(),
      this.dashboardRepository.getAuditoriaCount(),
      this.dashboardRepository.getExpedientesCount({
        from: periods.currentFrom,
        to: periods.currentTo,
      }),
      this.dashboardRepository.getExpedientesCount({
        from: periods.previousFrom,
        to: periods.previousTo,
      }),
      this.dashboardRepository.getActuacionesCount({
        from: periods.currentFrom,
        to: periods.currentTo,
      }),
      this.dashboardRepository.getActuacionesCount({
        from: periods.previousFrom,
        to: periods.previousTo,
      }),
      this.dashboardRepository.getDocumentosCount({
        from: periods.currentFrom,
        to: periods.currentTo,
      }),
      this.dashboardRepository.getDocumentosCount({
        from: periods.previousFrom,
        to: periods.previousTo,
      }),
      this.dashboardRepository.getAuditoriaCount({
        from: periods.currentFrom,
        to: periods.currentTo,
      }),
      this.dashboardRepository.getAuditoriaCount({
        from: periods.previousFrom,
        to: periods.previousTo,
      }),
      this.dashboardRepository.getRecordatoriosTodayCount(
        user.id,
        this.startOfDay(now),
        this.endOfDay(now),
      ),
      this.dashboardRepository.getUnreadNotificationsCount(user.id),
      this.dashboardRepository.getExpedientesByEstado(),
    ]);

    const kpis = [
      this.buildKpi(
        'expedientes',
        'Expedientes',
        totalExpedientes,
        currentExpedientes,
        previousExpedientes,
      ),
      this.buildKpi(
        'actuaciones',
        'Actuaciones',
        totalActuaciones,
        currentActuaciones,
        previousActuaciones,
      ),
      this.buildKpi(
        'documentos',
        'Documentos',
        totalDocumentos,
        currentDocumentos,
        previousDocumentos,
      ),
      this.buildKpi(
        'auditoria',
        'Auditoría',
        totalAuditoria,
        currentAuditoria,
        previousAuditoria,
      ),
    ];

    return {
      generatedAt: now.toISOString(),
      period: {
        windowDays,
        currentFrom: periods.currentFrom.toISOString(),
        currentTo: periods.currentTo.toISOString(),
        previousFrom: periods.previousFrom.toISOString(),
        previousTo: periods.previousTo.toISOString(),
      },
      kpis,
      remindersToday,
      unreadNotifications,
      expedientesByEstado,
    };
  }

  async getGauges(user: AuthenticatedUser, windowDays = 30) {
    const now = new Date();
    const periods = buildDashboardPeriods(windowDays, now);

    const [
      totalExpedientes,
      expedientesResolved,
      expedientesWithDocuments,
      overdueReminders,
      currentExpedientes,
      currentActuaciones,
      currentDocumentos,
      currentAuditoria,
    ] = await Promise.all([
      this.dashboardRepository.getExpedientesCount(),
      this.dashboardRepository.getExpedientesResolvedCount(),
      this.dashboardRepository.getExpedientesWithDocumentsCount(),
      this.dashboardRepository.getRecordatoriosOverdueStats(user.id, now),
      this.dashboardRepository.getExpedientesCount({
        from: periods.currentFrom,
        to: periods.currentTo,
      }),
      this.dashboardRepository.getActuacionesCount({
        from: periods.currentFrom,
        to: periods.currentTo,
      }),
      this.dashboardRepository.getDocumentosCount({
        from: periods.currentFrom,
        to: periods.currentTo,
      }),
      this.dashboardRepository.getAuditoriaCount({
        from: periods.currentFrom,
        to: periods.currentTo,
      }),
    ]);

    const actionsCurrentWindow =
      currentExpedientes + currentActuaciones + currentDocumentos;

    const resolutionRate = toPercent(expedientesResolved, totalExpedientes);
    const deadlineCompliance =
      overdueReminders.total > 0
        ? toPercent(overdueReminders.completados, overdueReminders.total)
        : 100;
    const documentIntegrity = toPercent(
      expedientesWithDocuments,
      totalExpedientes,
    );
    const auditCoverage = clampPercent(
      (currentAuditoria / Math.max(1, actionsCurrentWindow)) * 100,
    );

    return {
      generatedAt: now.toISOString(),
      period: {
        windowDays,
        currentFrom: periods.currentFrom.toISOString(),
        currentTo: periods.currentTo.toISOString(),
      },
      gauges: [
        {
          key: 'resolutionRate',
          label: 'Tasa de resolución',
          value: resolutionRate,
          numerator: expedientesResolved,
          denominator: totalExpedientes,
        },
        {
          key: 'deadlineCompliance',
          label: 'Cumplimiento de plazos',
          value: deadlineCompliance,
          numerator:
            overdueReminders.total > 0
              ? overdueReminders.completados
              : overdueReminders.total,
          denominator: overdueReminders.total,
        },
        {
          key: 'documentIntegrity',
          label: 'Integridad documental',
          value: documentIntegrity,
          numerator: expedientesWithDocuments,
          denominator: totalExpedientes,
        },
        {
          key: 'auditCoverage',
          label: 'Cobertura de auditoría',
          value: auditCoverage,
          numerator: currentAuditoria,
          denominator: Math.max(1, actionsCurrentWindow),
        },
      ],
    };
  }

  private buildKpi(
    key: string,
    label: string,
    value: number,
    currentWindowValue: number,
    previousWindowValue: number,
  ) {
    return {
      key,
      label,
      value,
      currentWindowValue,
      previousWindowValue,
      trendPercent: calculateTrendPercent(
        currentWindowValue,
        previousWindowValue,
      ),
      trendDirection: resolveTrendDirection(
        currentWindowValue,
        previousWindowValue,
      ),
    };
  }

  private startOfDay(date: Date): Date {
    const value = new Date(date);
    value.setHours(0, 0, 0, 0);
    return value;
  }

  private endOfDay(date: Date): Date {
    const value = new Date(date);
    value.setHours(23, 59, 59, 999);
    return value;
  }
}
