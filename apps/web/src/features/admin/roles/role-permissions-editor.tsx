import {
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import type { AdminPermissionItem, AdminRoleItem } from '../../../lib/contracts';

interface AdminRolePermissionsEditorProps {
  selectedRoleId: string | null;
  selectedPermissionIds: string[];
  permissions: AdminPermissionItem[];
  roles: AdminRoleItem[];
  loading: boolean;
  saving: boolean;
  onTogglePermission: (permissionId: string) => void;
  onSave: () => void;
}

export function AdminRolePermissionsEditor({
  selectedRoleId,
  selectedPermissionIds,
  permissions,
  roles,
  loading,
  saving,
  onTogglePermission,
  onSave,
}: AdminRolePermissionsEditorProps) {
  const selectedRoleName = roles.find((role) => role.id === selectedRoleId)?.nombre ?? '-';

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h6">Permisos del rol seleccionado</Typography>

        {!selectedRoleId ? (
          <Typography variant="body2" color="text.secondary">
            Selecciona un rol para editar sus permisos.
          </Typography>
        ) : loading ? (
          <Typography variant="body2" color="text.secondary">
            Cargando datos de permisos...
          </Typography>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary">
              Rol activo: <strong>{selectedRoleName}</strong>
            </Typography>

            <FormGroup>
              {permissions.map((permission) => (
                <FormControlLabel
                  key={permission.id}
                  control={
                    <Checkbox
                      checked={selectedPermissionIds.includes(permission.id)}
                      onChange={() => onTogglePermission(permission.id)}
                    />
                  }
                  label={`${permission.codigo}${
                    permission.descripcion ? ` — ${permission.descripcion}` : ''
                  }`}
                />
              ))}
            </FormGroup>

            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={onSave} disabled={saving}>
                Guardar permisos
              </Button>
            </Stack>
          </>
        )}
      </Stack>
    </Paper>
  );
}
