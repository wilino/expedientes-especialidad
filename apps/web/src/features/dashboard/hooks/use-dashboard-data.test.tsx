import type { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext, type AuthContextValue } from '../../auth/auth-context-store';
import { useDashboardData } from './use-dashboard-data';

function createWrapper(apiRequest: AuthContextValue['apiRequest']) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const authValue: AuthContextValue = {
    user: null,
    isAuthenticated: true,
    isInitializing: false,
    login: vi.fn(),
    logout: vi.fn(),
    apiRequest,
    apiRequestBlob: vi.fn(),
  };

  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
    </QueryClientProvider>
  );
}

describe('useDashboardData', () => {
  it('loads summary, gauges and activity in parallel', async () => {
    const apiRequest = vi.fn(async (path: string) => {
      if (path.startsWith('/dashboard/summary')) {
        return {
          generatedAt: new Date().toISOString(),
          period: {
            windowDays: 30,
            currentFrom: new Date().toISOString(),
            currentTo: new Date().toISOString(),
            previousFrom: new Date().toISOString(),
            previousTo: new Date().toISOString(),
          },
          kpis: [],
          remindersToday: 0,
          unreadNotifications: 0,
          expedientesByEstado: [],
        };
      }

      if (path.startsWith('/dashboard/gauges')) {
        return {
          generatedAt: new Date().toISOString(),
          period: {
            windowDays: 30,
            currentFrom: new Date().toISOString(),
            currentTo: new Date().toISOString(),
          },
          gauges: [],
        };
      }

      return { data: [] };
    }) as unknown as AuthContextValue['apiRequest'];

    const { result } = renderHook(() => useDashboardData(30), {
      wrapper: createWrapper(apiRequest),
    });

    await waitFor(() => {
      expect(result.current.summaryQuery.isSuccess).toBe(true);
      expect(result.current.gaugesQuery.isSuccess).toBe(true);
      expect(result.current.activityQuery.isSuccess).toBe(true);
    });

    expect(apiRequest).toHaveBeenCalledWith('/dashboard/summary?windowDays=30');
    expect(apiRequest).toHaveBeenCalledWith('/dashboard/gauges?windowDays=30');
    expect(apiRequest).toHaveBeenCalledWith('/actividad/reciente?limit=10');
  });
});
