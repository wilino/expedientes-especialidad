import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../auth/use-auth';
import { createDashboardApi } from '../dashboard-api';

export function useDashboardData(windowDays = 30) {
  const { apiRequest } = useAuth();
  const dashboardApi = useMemo(() => createDashboardApi({ apiRequest }), [apiRequest]);

  const summaryQuery = useQuery({
    queryKey: ['dashboard', 'summary', windowDays],
    queryFn: () => dashboardApi.getSummary(windowDays),
  });

  const gaugesQuery = useQuery({
    queryKey: ['dashboard', 'gauges', windowDays],
    queryFn: () => dashboardApi.getGauges(windowDays),
  });

  const activityQuery = useQuery({
    queryKey: ['dashboard', 'activity', 10],
    queryFn: () => dashboardApi.getRecentActivity(10),
  });

  return {
    summaryQuery,
    gaugesQuery,
    activityQuery,
  };
}
