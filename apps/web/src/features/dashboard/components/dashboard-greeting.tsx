import { Box, Typography } from '@mui/material';
import { formatLongDate } from '../formatters';

interface DashboardGreetingProps {
  userName?: string | null;
  remindersToday: number;
}

export function DashboardGreeting({ userName, remindersToday }: DashboardGreetingProps) {
  const greetingDate = formatLongDate(new Date());

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #1B2A4A 0%, #2E4068 100%)',
        borderRadius: 3,
        p: { xs: 2.5, md: 3 },
        color: 'common.white',
      }}
    >
      <Typography variant="h4" fontWeight={800}>
        Buenos días{userName ? `, ${userName}` : ''}
      </Typography>
      <Typography variant="body2" sx={{ opacity: 0.82, mt: 0.5 }}>
        {greetingDate} · Tienes {remindersToday} recordatorio
        {remindersToday === 1 ? '' : 's'} hoy
      </Typography>
    </Box>
  );
}
