import type { ReactNode } from 'react';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import GavelRoundedIcon from '@mui/icons-material/GavelRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import { Alert, Box, Skeleton, Stack } from '@mui/material';
import { useAuth } from '../features/auth/use-auth';
import {
  ActivityTimeline,
  DashboardGreeting,
  ExpedienteDonutChart,
  GaugePanel,
  NotificationPanel,
  ReminderPanel,
  StatCard,
  useDashboardData,
  useNotifications,
  useReminders,
  type CreateReminderInput,
} from '../features/dashboard';
import type { DashboardSummaryResponse } from '../lib/contracts';

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

const kpiIconMap: Record<string, ReactNode> = {
  expedientes: <FolderOpenRoundedIcon fontSize="small" />,
  actuaciones: <GavelRoundedIcon fontSize="small" />,
  documentos: <DescriptionRoundedIcon fontSize="small" />,
  auditoria: <FactCheckRoundedIcon fontSize="small" />,
};

function KPISection({
  summary,
  loading,
}: {
  summary?: DashboardSummaryResponse;
  loading: boolean;
}) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, minmax(0, 1fr))',
          lg: 'repeat(4, minmax(0, 1fr))',
        },
        gap: 1.2,
      }}
    >
      {loading
        ? Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" animation="wave" sx={{ borderRadius: 2, height: 120 }} />
          ))
        : (summary?.kpis ?? []).map((kpi) => (
            <StatCard
              key={kpi.key}
              icon={kpiIconMap[kpi.key] ?? <FolderOpenRoundedIcon fontSize="small" />}
              label={kpi.label}
              value={kpi.value}
              trendPercent={kpi.trendPercent}
              trendDirection={kpi.trendDirection}
            />
          ))}
    </Box>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const { summaryQuery, gaugesQuery, activityQuery } = useDashboardData(30);
  const { notificationsQuery, markReadMutation } = useNotifications({ take: 20 });
  const { remindersQuery, createReminderMutation, updateReminderMutation } = useReminders({
    take: 50,
  });

  const summary = summaryQuery.data;
  const gauges = gaugesQuery.data?.gauges ?? [];
  const activityEvents = activityQuery.data?.data ?? [];
  const notifications = notificationsQuery.data?.data ?? [];
  const unreadCount = notificationsQuery.data?.unreadCount ?? 0;
  const reminders = remindersQuery.data?.data ?? [];

  const handleMarkRead = (id: string) => {
    markReadMutation.mutate(id);
  };

  const handleToggleReminder = (id: string, completado: boolean) => {
    updateReminderMutation.mutate({ id, completado });
  };

  const handleCreateReminder = async (payload: CreateReminderInput) => {
    await createReminderMutation.mutateAsync(payload);
  };

  return (
    <Stack spacing={2.2}>
      <DashboardGreeting userName={user?.nombre} remindersToday={summary?.remindersToday ?? 0} />

      {summaryQuery.isError ? (
        <Alert severity="error">{toErrorMessage(summaryQuery.error, 'No se pudo cargar el dashboard')}</Alert>
      ) : null}

      <KPISection summary={summary} loading={summaryQuery.isLoading} />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', xl: '7fr 5fr' },
          gap: 1.5,
          alignItems: 'start',
        }}
      >
        <GaugePanel
          gauges={gauges}
          loading={gaugesQuery.isLoading}
          error={gaugesQuery.isError ? toErrorMessage(gaugesQuery.error, 'Error al cargar gauges') : null}
        />

        <NotificationPanel
          items={notifications}
          unreadCount={unreadCount}
          loading={notificationsQuery.isLoading}
          error={
            notificationsQuery.isError
              ? toErrorMessage(notificationsQuery.error, 'Error al cargar notificaciones')
              : null
          }
          onMarkRead={handleMarkRead}
          markingId={markReadMutation.variables ?? null}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', xl: '7fr 5fr' },
          gap: 1.5,
          alignItems: 'start',
        }}
      >
        <ExpedienteDonutChart data={summary?.expedientesByEstado ?? []} loading={summaryQuery.isLoading} />

        <ReminderPanel
          items={reminders}
          loading={remindersQuery.isLoading}
          error={remindersQuery.isError ? toErrorMessage(remindersQuery.error, 'Error al cargar recordatorios') : null}
          creating={createReminderMutation.isPending}
          updatingId={updateReminderMutation.variables?.id ?? null}
          onToggleComplete={handleToggleReminder}
          onCreate={handleCreateReminder}
        />
      </Box>

      <ActivityTimeline
        events={activityEvents}
        loading={activityQuery.isLoading}
        error={activityQuery.isError ? toErrorMessage(activityQuery.error, 'Error al cargar actividad') : null}
      />
    </Stack>
  );
}
