import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import type { RecordatorioPrioridad, ReminderItem } from '../../../lib/contracts';
import type { CreateReminderInput } from '../dashboard-api';
import { formatDateTime } from '../formatters';

interface ReminderPanelProps {
  items: ReminderItem[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  updatingId?: string | null;
  onToggleComplete: (id: string, completado: boolean) => void;
  onCreate: (payload: CreateReminderInput) => Promise<void>;
}

interface ReminderFormState {
  titulo: string;
  descripcion: string;
  date: string;
  time: string;
  prioridad: RecordatorioPrioridad;
}

function getDefaultFormState(): ReminderFormState {
  const nextHour = new Date(Date.now() + 60 * 60 * 1000);
  const date = nextHour.toISOString().slice(0, 10);
  const time = nextHour.toTimeString().slice(0, 5);

  return {
    titulo: '',
    descripcion: '',
    date,
    time,
    prioridad: 'NORMAL',
  };
}

function getGroupLabel(dateKey: string): string {
  const date = new Date(dateKey);
  const now = new Date();

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  if (target.getTime() === today.getTime()) {
    return 'Hoy';
  }

  if (target.getTime() === tomorrow.getTime()) {
    return 'Mañana';
  }

  return target.toLocaleDateString('es-BO', {
    day: '2-digit',
    month: 'short',
  });
}

export function ReminderPanel({
  items,
  loading,
  error,
  creating,
  updatingId,
  onToggleComplete,
  onCreate,
}: ReminderPanelProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<ReminderFormState>(getDefaultFormState);

  const grouped = useMemo(() => {
    const map = new Map<string, ReminderItem[]>();

    for (const item of items) {
      const key = item.fechaHora.slice(0, 10);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)?.push(item);
    }

    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [items]);

  const handleCreate = async () => {
    if (!form.titulo.trim()) {
      return;
    }

    const isoDate = new Date(`${form.date}T${form.time}:00`).toISOString();
    await onCreate({
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim() || undefined,
      fechaHora: isoDate,
      prioridad: form.prioridad,
    });

    setDialogOpen(false);
    setForm(getDefaultFormState());
  };

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
          Recordatorios
        </Typography>

        <IconButton aria-label="Agregar recordatorio" size="small" onClick={() => setDialogOpen(true)}>
          <AddRoundedIcon fontSize="small" />
        </IconButton>
      </Box>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Stack sx={{ p: 2, overflow: 'auto', flex: 1 }} spacing={2}>
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} variant="rounded" animation="wave" sx={{ borderRadius: 2, height: 62 }} />
            ))
          : grouped.map(([key, group]) => (
              <Stack key={key} spacing={0.7}>
                <Typography variant="overline" color="secondary.main" fontWeight={700}>
                  {getGroupLabel(key)}
                </Typography>

                {group.map((item) => (
                  <Stack
                    key={item.id}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{
                      py: 0.3,
                      opacity: item.completado ? 0.65 : 1,
                    }}
                  >
                    <Checkbox
                      size="small"
                      checked={item.completado}
                      disabled={updatingId === item.id}
                      onChange={(event) => onToggleComplete(item.id, event.target.checked)}
                    />

                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ textDecoration: item.completado ? 'line-through' : 'none' }}
                      >
                        {item.titulo}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDateTime(item.fechaHora)}
                        {item.descripcion ? ` · ${item.descripcion}` : ''}
                      </Typography>
                    </Box>

                    <Chip
                      label={item.prioridad.toLowerCase()}
                      size="small"
                      color={item.prioridad === 'URGENTE' ? 'error' : 'default'}
                    />
                  </Stack>
                ))}
              </Stack>
            ))}
      </Stack>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Nuevo recordatorio</DialogTitle>
        <DialogContent>
          <Stack spacing={1.2} sx={{ pt: 1 }}>
            <TextField
              label="Título"
              value={form.titulo}
              onChange={(event) => setForm((prev) => ({ ...prev, titulo: event.target.value }))}
            />
            <TextField
              label="Descripción"
              value={form.descripcion}
              onChange={(event) => setForm((prev) => ({ ...prev, descripcion: event.target.value }))}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField
                label="Fecha"
                type="date"
                value={form.date}
                onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Hora"
                type="time"
                value={form.time}
                onChange={(event) => setForm((prev) => ({ ...prev, time: event.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
            <TextField
              label="Prioridad"
              select
              SelectProps={{ native: true }}
              value={form.prioridad}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  prioridad: event.target.value as RecordatorioPrioridad,
                }))
              }
            >
              <option value="URGENTE">Urgente</option>
              <option value="NORMAL">Normal</option>
              <option value="BAJA">Baja</option>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color="inherit" onClick={() => setDialogOpen(false)}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={() => void handleCreate()} disabled={creating}>
            {creating ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
