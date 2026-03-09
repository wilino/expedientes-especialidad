import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../auth/use-auth';
import { createDashboardApi, type CreateReminderInput, type UpdateReminderInput } from '../dashboard-api';

interface UseRemindersOptions {
  take?: number;
}

function getDefaultRange() {
  const now = new Date();
  const from = new Date(now);
  from.setHours(0, 0, 0, 0);

  const to = new Date(now);
  to.setDate(to.getDate() + 7);
  to.setHours(23, 59, 59, 999);

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

export function useReminders(options: UseRemindersOptions = {}) {
  const { apiRequest } = useAuth();
  const queryClient = useQueryClient();
  const take = options.take ?? 50;
  const range = getDefaultRange();
  const dashboardApi = useMemo(() => createDashboardApi({ apiRequest }), [apiRequest]);

  const remindersQuery = useQuery({
    queryKey: ['dashboard', 'reminders', range.from, range.to, take],
    queryFn: () =>
      dashboardApi.listReminders({
        from: range.from,
        to: range.to,
        take,
      }),
  });

  const createReminderMutation = useMutation({
    mutationFn: (payload: CreateReminderInput) => dashboardApi.createReminder(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['dashboard', 'reminders'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard', 'gauges'] });
    },
  });

  const updateReminderMutation = useMutation({
    mutationFn: (payload: UpdateReminderInput) => dashboardApi.updateReminder(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['dashboard', 'reminders'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard', 'gauges'] });
    },
  });

  return {
    remindersQuery,
    createReminderMutation,
    updateReminderMutation,
  };
}
