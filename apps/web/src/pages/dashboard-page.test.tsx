import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardPage } from './dashboard-page';

interface DashboardHookMockState {
  summaryQuery: {
    data: {
      generatedAt: string;
      period: {
        windowDays: number;
        currentFrom: string;
        currentTo: string;
        previousFrom: string;
        previousTo: string;
      };
      kpis: Array<{
        key: string;
        label: string;
        value: number;
        currentWindowValue: number;
        previousWindowValue: number;
        trendPercent: number;
        trendDirection: 'up' | 'down' | 'flat';
      }>;
      remindersToday: number;
      unreadNotifications: number;
      expedientesByEstado: unknown[];
    };
    isLoading: boolean;
    isError: boolean;
    error: unknown;
  };
  gaugesQuery: {
    data: { gauges: unknown[] };
    isLoading: boolean;
    isError: boolean;
    error: unknown;
  };
  activityQuery: {
    data: { data: unknown[] };
    isLoading: boolean;
    isError: boolean;
    error: unknown;
  };
}

const dashboardState: DashboardHookMockState = {
  summaryQuery: {
    data: {
      generatedAt: new Date().toISOString(),
      period: {
        windowDays: 30,
        currentFrom: new Date().toISOString(),
        currentTo: new Date().toISOString(),
        previousFrom: new Date().toISOString(),
        previousTo: new Date().toISOString(),
      },
      kpis: [
        {
          key: 'expedientes',
          label: 'Expedientes',
          value: 120,
          currentWindowValue: 10,
          previousWindowValue: 8,
          trendPercent: 25,
          trendDirection: 'up' as const,
        },
      ],
      remindersToday: 2,
      unreadNotifications: 1,
      expedientesByEstado: [],
    },
    isLoading: false,
    isError: false,
    error: null,
  },
  gaugesQuery: {
    data: { gauges: [] },
    isLoading: false,
    isError: false,
    error: null,
  },
  activityQuery: {
    data: { data: [] },
    isLoading: false,
    isError: false,
    error: null,
  },
};

const notificationsState = {
  notificationsQuery: {
    data: { data: [], unreadCount: 0 },
    isLoading: false,
    isError: false,
    error: null,
  },
  markReadMutation: {
    mutate: vi.fn(),
    variables: null,
  },
};

const remindersState = {
  remindersQuery: {
    data: { data: [] },
    isLoading: false,
    isError: false,
    error: null,
  },
  createReminderMutation: {
    mutateAsync: vi.fn(),
    isPending: false,
  },
  updateReminderMutation: {
    mutate: vi.fn(),
    variables: null,
  },
};

vi.mock('../features/auth/use-auth', () => ({
  useAuth: () => ({ user: { nombre: 'Abg. Test' } }),
}));

vi.mock('../features/dashboard', () => ({
  useDashboardData: () => dashboardState,
  useNotifications: () => notificationsState,
  useReminders: () => remindersState,
  DashboardGreeting: ({ remindersToday }: { remindersToday: number }) => (
    <div>Greeting {remindersToday}</div>
  ),
  StatCard: ({ label }: { label: string }) => <div>Stat {label}</div>,
  GaugePanel: () => <div>GaugePanel</div>,
  NotificationPanel: () => <div>NotificationPanel</div>,
  ReminderPanel: () => <div>ReminderPanel</div>,
  ExpedienteDonutChart: () => <div>Donut</div>,
  ActivityTimeline: () => <div>Timeline</div>,
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    dashboardState.summaryQuery.isError = false;
    dashboardState.summaryQuery.error = null;
  });

  it('renders success state with dashboard sections', () => {
    render(<DashboardPage />);

    expect(screen.getByText('Greeting 2')).toBeInTheDocument();
    expect(screen.getByText('Stat Expedientes')).toBeInTheDocument();
    expect(screen.getByText('GaugePanel')).toBeInTheDocument();
    expect(screen.getByText('Timeline')).toBeInTheDocument();
  });

  it('renders summary error alert', () => {
    dashboardState.summaryQuery.isError = true;
    dashboardState.summaryQuery.error = new Error('Error cargando resumen');

    render(<DashboardPage />);

    expect(screen.getByText('Error cargando resumen')).toBeInTheDocument();
  });
});
