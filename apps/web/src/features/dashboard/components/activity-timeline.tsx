import { Alert, Card, Skeleton, Stack, Typography } from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import type { ActivityRecentResponse } from '../../../lib/contracts';
import { formatDateTime } from '../formatters';

interface ActivityTimelineProps {
  events: ActivityRecentResponse['data'];
  loading: boolean;
  error: string | null;
}

function getDotColor(resultado: string): 'success' | 'error' | 'warning' | 'info' {
  if (resultado === 'EXITO') {
    return 'success';
  }

  if (resultado === 'ERROR') {
    return 'error';
  }

  if (resultado === 'DENEGADO') {
    return 'warning';
  }

  return 'info';
}

export function ActivityTimeline({ events, loading, error }: ActivityTimelineProps) {
  return (
    <Card sx={{ p: 2.5 }}>
      <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5 }}>
        Actividad reciente
      </Typography>

      {error ? <Alert severity="error">{error}</Alert> : null}

      {loading ? (
        <Stack spacing={1}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" sx={{ height: 52 }} />
          ))}
        </Stack>
      ) : (
        <Timeline position="right" sx={{ m: 0, p: 0 }}>
          {events.map((event, index) => (
            <TimelineItem key={event.id}>
              <TimelineSeparator>
                <TimelineDot color={getDotColor(event.resultado)} />
                {index < events.length - 1 ? <TimelineConnector /> : null}
              </TimelineSeparator>
              <TimelineContent sx={{ pb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  {formatDateTime(event.timestamp)}
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {event.accion} · {event.recurso}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {event.usuario?.nombre ?? 'Sistema'}
                  {event.expediente?.codigo ? ` · ${event.expediente.codigo}` : ''}
                </Typography>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      )}
    </Card>
  );
}
