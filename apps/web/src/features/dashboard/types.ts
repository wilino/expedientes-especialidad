import type {
  DashboardGaugesResponse,
  DashboardSummaryResponse,
  NotificationItem,
  ReminderItem,
} from '../../lib/contracts';

export type DashboardKpi = DashboardSummaryResponse['kpis'][number];
export type DashboardGauge = DashboardGaugesResponse['gauges'][number];
export type DashboardEstadoSlice = DashboardSummaryResponse['expedientesByEstado'][number];

export interface DashboardNotificationsState {
  data: NotificationItem[];
  unreadCount: number;
}

export interface DashboardRemindersState {
  data: ReminderItem[];
}
