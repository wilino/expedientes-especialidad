import type {
  ActivityRecentResponse,
  DashboardGaugesResponse,
  DashboardSummaryResponse,
  NotificationsListResponse,
  ReminderItem,
  RemindersListResponse,
  RecordatorioPrioridad,
} from '../../lib/contracts';

interface DashboardApiClient {
  apiRequest: <T>(path: string, init?: RequestInit) => Promise<T>;
}

export interface CreateReminderInput {
  titulo: string;
  descripcion?: string;
  fechaHora: string;
  prioridad: RecordatorioPrioridad;
}

export interface UpdateReminderInput {
  id: string;
  titulo?: string;
  descripcion?: string;
  fechaHora?: string;
  prioridad?: RecordatorioPrioridad;
  completado?: boolean;
}

export function createDashboardApi({ apiRequest }: DashboardApiClient) {
  return {
    getSummary(windowDays = 30) {
      const query = new URLSearchParams({ windowDays: String(windowDays) });
      return apiRequest<DashboardSummaryResponse>(`/dashboard/summary?${query.toString()}`);
    },

    getGauges(windowDays = 30) {
      const query = new URLSearchParams({ windowDays: String(windowDays) });
      return apiRequest<DashboardGaugesResponse>(`/dashboard/gauges?${query.toString()}`);
    },

    getRecentActivity(limit = 10) {
      const query = new URLSearchParams({ limit: String(limit) });
      return apiRequest<ActivityRecentResponse>(`/actividad/reciente?${query.toString()}`);
    },

    listNotifications(take = 20) {
      const query = new URLSearchParams({ take: String(take) });
      return apiRequest<NotificationsListResponse>(`/notificaciones?${query.toString()}`);
    },

    markNotificationAsRead(id: string) {
      return apiRequest<{ unreadCount: number }>(`/notificaciones/${id}/read`, {
        method: 'POST',
      });
    },

    listReminders(params?: { from?: string; to?: string; take?: number }) {
      const query = new URLSearchParams();
      if (params?.from) {
        query.set('from', params.from);
      }
      if (params?.to) {
        query.set('to', params.to);
      }
      if (typeof params?.take === 'number') {
        query.set('take', String(params.take));
      }

      const suffix = query.toString() ? `?${query.toString()}` : '';
      return apiRequest<RemindersListResponse>(`/recordatorios${suffix}`);
    },

    createReminder(payload: CreateReminderInput) {
      return apiRequest<ReminderItem>('/recordatorios', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    updateReminder(payload: UpdateReminderInput) {
      const { id, ...rest } = payload;
      return apiRequest<ReminderItem>(`/recordatorios/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(rest),
      });
    },
  };
}
