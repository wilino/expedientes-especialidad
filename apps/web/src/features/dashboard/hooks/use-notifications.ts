import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../auth/use-auth';
import { createDashboardApi } from '../dashboard-api';

interface UseNotificationsOptions {
  take?: number;
  enabled?: boolean;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { apiRequest } = useAuth();
  const queryClient = useQueryClient();
  const take = options.take ?? 20;
  const dashboardApi = useMemo(() => createDashboardApi({ apiRequest }), [apiRequest]);

  const notificationsQuery = useQuery({
    queryKey: ['dashboard', 'notifications', take],
    queryFn: () => dashboardApi.listNotifications(take),
    enabled: options.enabled ?? true,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => dashboardApi.markNotificationAsRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['dashboard', 'notifications'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
    },
  });

  return {
    notificationsQuery,
    markReadMutation,
  };
}
