import { Box, Divider, Grid, Paper, Typography } from '@mui/material';
import type { ExpedienteDetail } from '../../../lib/contracts';
import { EstadoChip } from '../estado-chip';

export function ExpedienteMainInfo({ expediente }: { expediente: ExpedienteDetail }) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h3" gutterBottom>
        Información del expediente
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography variant="overline" color="text.secondary">
            Código
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {expediente.codigo}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography variant="overline" color="text.secondary">
            Estado
          </Typography>
          <Box sx={{ mt: 0.5 }}>
            <EstadoChip estado={expediente.estado} />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography variant="overline" color="text.secondary">
            Fecha de apertura
          </Typography>
          <Typography variant="body1">
            {new Date(expediente.fechaApertura).toLocaleDateString('es-BO', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography variant="overline" color="text.secondary">
            Creador
          </Typography>
          <Typography variant="body1">{expediente.creador.nombre}</Typography>
          <Typography variant="caption" color="text.secondary">
            {expediente.creador.correo}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography variant="overline" color="text.secondary">
            Carátula
          </Typography>
          <Typography variant="body1">{expediente.caratula}</Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}
