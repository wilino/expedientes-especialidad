import { useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, Button, Grid, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { PageHeader } from '../ui/components';
import {
  EditExpedienteDialog,
  ExpedienteMainInfo,
  ExpedienteRelatedCard,
  useExpedienteDetail,
} from '../features/expedientes';
import { usePermissions } from '../features/auth/use-permissions';
import { PermissionCodes } from '../features/auth/permission-codes';
import { useFeedbackSnackbar } from '../ui/hooks/use-feedback-snackbar';

export function ExpedienteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const feedback = useFeedbackSnackbar();
  const { can } = usePermissions();
  const canReadActuaciones = can(PermissionCodes.ACTUACION_READ);
  const canReadDocumentos = can(PermissionCodes.DOCUMENTO_READ);
  const canUpdateExpediente = can(PermissionCodes.EXPEDIENTE_UPDATE);
  const [editOpen, setEditOpen] = useState(false);

  const { detailQuery, actuacionesQuery, documentosQuery, updateMutation } =
    useExpedienteDetail(id ?? null, {
      canReadActuaciones,
      canReadDocumentos,
    });

  const expediente = detailQuery.data ?? null;
  const actuaciones = canReadActuaciones ? actuacionesQuery.data ?? [] : [];
  const documentos = canReadDocumentos ? documentosQuery.data ?? [] : [];

  const handleSaveEdit = async (expedienteId: string, caratula: string) => {
    try {
      await updateMutation.mutateAsync({ id: expedienteId, caratula });
      feedback.success('Expediente actualizado');
    } catch (error) {
      feedback.error(error, 'Error al actualizar');
      throw error;
    }
  };

  if (!id) {
    return (
      <Stack spacing={2} sx={{ p: 2 }}>
        <Alert severity="error">Expediente no encontrado</Alert>
      </Stack>
    );
  }

  if (detailQuery.isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="text.secondary">Cargando expediente...</Typography>
      </Box>
    );
  }

  if (detailQuery.isError || !expediente) {
    return (
      <Stack spacing={2} sx={{ p: 2 }}>
        <Alert severity="error">
          {detailQuery.error instanceof Error
            ? detailQuery.error.message
            : 'Expediente no encontrado'}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          component={RouterLink}
          to="/expedientes"
        >
          Volver al listado
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow="Expediente"
        title={expediente.codigo}
        subtitle={expediente.caratula}
        actions={
          <Stack direction="row" spacing={1}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/expedientes')}>
              Volver
            </Button>
            {canUpdateExpediente ? (
              <Button variant="contained" startIcon={<EditIcon />} onClick={() => setEditOpen(true)}>
                Editar
              </Button>
            ) : null}
          </Stack>
        }
      />

      <ExpedienteMainInfo expediente={expediente} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ExpedienteRelatedCard
            title="Actuaciones"
            count={actuaciones.length}
            canRead={canReadActuaciones}
            linkTo={`/actuaciones?expedienteId=${expediente.id}`}
            noAccessMessage="No tienes permiso para ver actuaciones."
            emptyMessage="No hay actuaciones registradas"
            entries={actuaciones.map((item) => ({
              id: item.id,
              primary: `${item.tipo} — ${item.descripcion}`,
              secondary: new Date(item.fecha).toLocaleDateString('es-BO'),
            }))}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ExpedienteRelatedCard
            title="Documentos"
            count={documentos.length}
            canRead={canReadDocumentos}
            linkTo={`/documentos?expedienteId=${expediente.id}`}
            noAccessMessage="No tienes permiso para ver documentos."
            emptyMessage="No hay documentos adjuntos"
            entries={documentos.map((item) => ({
              id: item.id,
              primary: item.nombre,
              secondary: `${item.tipo} — ${new Date(item.fecha).toLocaleDateString('es-BO')}`,
            }))}
          />
        </Grid>
      </Grid>

      <EditExpedienteDialog
        open={editOpen}
        expediente={expediente}
        onClose={() => setEditOpen(false)}
        onSave={handleSaveEdit}
      />
    </Stack>
  );
}
