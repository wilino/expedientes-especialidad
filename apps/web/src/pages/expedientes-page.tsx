import { useState } from 'react';
import { Box, Button, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../ui/components';
import {
  CreateExpedienteDialog,
  EditExpedienteDialog,
  ExpedientesFilterBar,
  ExpedientesTable,
  useExpedientesList,
} from '../features/expedientes';
import { usePermissions } from '../features/auth/use-permissions';
import { PermissionCodes } from '../features/auth/permission-codes';
import { useFeedbackSnackbar } from '../ui/hooks/use-feedback-snackbar';
import type { EstadoExpediente, ExpedienteItem } from '../lib/contracts';

const Permisos = PermissionCodes;

export function ExpedientesPage() {
  const navigate = useNavigate();
  const feedback = useFeedbackSnackbar();
  const { can } = usePermissions();
  const canCreate = can(Permisos.EXPEDIENTE_CREATE);
  const canUpdate = can(Permisos.EXPEDIENTE_UPDATE);
  const canChangeState = can(Permisos.EXPEDIENTE_CHANGE_STATE);

  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ExpedienteItem | null>(null);

  const { listQuery, createMutation, updateMutation, changeEstadoMutation } =
    useExpedientesList(appliedQuery);

  const expedientes = listQuery.data?.data ?? [];
  const total = listQuery.data?.total ?? 0;

  const handleCreate = async (codigo: string, caratula: string) => {
    try {
      await createMutation.mutateAsync({ codigo, caratula });
      feedback.success('Expediente creado correctamente');
    } catch (error) {
      feedback.error(error, 'Error al crear expediente');
      throw error;
    }
  };

  const handleEdit = async (id: string, caratula: string) => {
    try {
      await updateMutation.mutateAsync({ id, caratula });
      feedback.success('Expediente actualizado');
    } catch (error) {
      feedback.error(error, 'Error al actualizar');
      throw error;
    }
  };

  const handleEstadoChange = async (id: string, estado: EstadoExpediente) => {
    try {
      await changeEstadoMutation.mutateAsync({ id, estado });
      feedback.success('Estado actualizado');
    } catch (error) {
      feedback.error(error, 'Transición de estado inválida');
    }
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow="Gestión de casos"
        title="Expedientes"
        subtitle={`${total} expediente${total !== 1 ? 's' : ''} registrado${
          total !== 1 ? 's' : ''
        }`}
        actions={
          canCreate ? (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
              Nuevo expediente
            </Button>
          ) : undefined
        }
      />

      <ExpedientesFilterBar
        query={query}
        onQueryChange={setQuery}
        onApply={() => setAppliedQuery(query.trim())}
      />

      {listQuery.isError ? (
        <Box sx={{ color: 'error.main' }}>
          {listQuery.error instanceof Error
            ? listQuery.error.message
            : 'No se pudo cargar expedientes'}
        </Box>
      ) : null}

      <ExpedientesTable
        rows={expedientes}
        loading={listQuery.isLoading}
        canUpdate={canUpdate}
        canChangeState={canChangeState}
        onViewDetail={(item) => navigate(`/expedientes/${item.id}`)}
        onEdit={(item) => setEditTarget(item)}
        onChangeState={(id, estado) => void handleEstadoChange(id, estado)}
      />

      <CreateExpedienteDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={handleCreate}
      />

      <EditExpedienteDialog
        open={!!editTarget}
        expediente={editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handleEdit}
      />
    </Stack>
  );
}
