import {
  Alert,
  Avatar,
  Badge,
  Box,
  Card,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import type { NotificationItem } from '../../../lib/contracts';
import { formatRelativeMinutes } from '../formatters';

interface NotificationPanelProps {
  items: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  onMarkRead: (id: string) => void;
  markingId?: string | null;
}

function getNotificationVisual(tipo: NotificationItem['tipo']) {
  if (tipo === 'VENCIMIENTO') {
    return { icon: WarningAmberRoundedIcon, color: '#D32F2F' };
  }

  if (tipo === 'ALERTA') {
    return { icon: NotificationsActiveRoundedIcon, color: '#E8A317' };
  }

  if (tipo === 'EXITO') {
    return { icon: CheckCircleRoundedIcon, color: '#22A96B' };
  }

  return { icon: InfoOutlinedIcon, color: '#4A90D9' };
}

export function NotificationPanel({
  items,
  unreadCount,
  loading,
  error,
  onMarkRead,
  markingId,
}: NotificationPanelProps) {
  return (
    <Card sx={{ p: 0, maxHeight: 470, display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6" fontWeight={800}>
          Notificaciones
        </Typography>

        <Badge color="error" badgeContent={unreadCount} max={99}>
          <NotificationsActiveRoundedIcon color="action" />
        </Badge>
      </Box>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <List sx={{ flex: 1, overflow: 'auto', py: 0 }}>
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <ListItem key={index} sx={{ py: 1.5 }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Stack sx={{ flex: 1, ml: 1 }} spacing={0.6}>
                  <Skeleton variant="text" width="70%" />
                  <Skeleton variant="text" width="35%" />
                </Stack>
              </ListItem>
            ))
          : items.map((item) => {
              const visual = getNotificationVisual(item.tipo);
              const Icon = visual.icon;

              return (
                <ListItem
                  key={item.id}
                  sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    alignItems: 'center',
                  }}
                  secondaryAction={
                    !item.readOnly && !item.leida ? (
                      <Tooltip title="Marcar como leída">
                        <span>
                          <IconButton
                            aria-label="Marcar como leída"
                            edge="end"
                            size="small"
                            onClick={() => onMarkRead(item.id)}
                            disabled={markingId === item.id}
                          >
                            <DoneRoundedIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    ) : null
                  }
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: `${visual.color}22`,
                        color: visual.color,
                        width: 40,
                        height: 40,
                      }}
                    >
                      <Icon fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.titulo}
                    secondary={item.mensaje ?? formatRelativeMinutes(item.createdAt)}
                    primaryTypographyProps={{
                      fontWeight: item.leida ? 500 : 700,
                      fontSize: 14,
                    }}
                    secondaryTypographyProps={{
                      fontSize: 12,
                      color: 'text.secondary',
                    }}
                  />
                </ListItem>
              );
            })}
      </List>
    </Card>
  );
}
