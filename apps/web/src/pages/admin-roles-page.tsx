import { useState } from 'react';
import { Alert, Stack } from '@mui/material';
import { PageHeader } from '../ui/components';
import { useAdminRoles } from '../features/admin/use-admin-roles';
import { useAuth } from '../features/auth/use-auth';
import { useFeedbackSnackbar } from '../ui/hooks/use-feedback-snackbar';
import {
  AdminRoleCreateForm,
  AdminRolePermissionsEditor,
  AdminRolesTable,
} from '../features/admin/roles';

export function AdminRolesPage() {
  const feedback = useFeedbackSnackbar();
  const { user: authenticatedUser, logout } = useAuth();
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');

  const {
    rolesQuery,
    permissionsQuery,
    createRoleMutation,
    setRolePermissionsMutation,
  } = useAdminRoles(selectedRoleId);

  const onCreateRole = async () => {
    if (!roleName.trim()) {
      feedback.warning('El nombre del rol es obligatorio.');
      return;
    }

    try {
      const createdRole = await createRoleMutation.mutateAsync({
        nombre: roleName.trim(),
        descripcion: roleDescription.trim() || undefined,
      });
      setRoleName('');
      setRoleDescription('');
      setSelectedPermissionIds([]);
      setSelectedRoleId(createdRole.id);
      feedback.success('Rol creado correctamente.');
    } catch (error) {
      feedback.error(error, 'No se pudo crear el rol.');
    }
  };

  const onTogglePermission = (permissionId: string) => {
    setSelectedPermissionIds((previous) =>
      previous.includes(permissionId)
        ? previous.filter((item) => item !== permissionId)
        : [...previous, permissionId],
    );
  };

  const onSavePermissions = async () => {
    if (!selectedRoleId) {
      feedback.warning('Selecciona un rol para actualizar permisos.');
      return;
    }

    try {
      await setRolePermissionsMutation.mutateAsync({
        roleId: selectedRoleId,
        permissionIds: selectedPermissionIds,
      });
      feedback.success('Permisos del rol actualizados.');

      const selectedRole = (rolesQuery.data ?? []).find((role) => role.id === selectedRoleId);
      const roleNameToValidate = selectedRole?.nombre;
      if (roleNameToValidate && authenticatedUser?.roles.includes(roleNameToValidate)) {
        feedback.info('Tus permisos cambiaron. Debes iniciar sesión nuevamente.');
        await logout();
      }
    } catch (error) {
      feedback.error(error, 'No se pudieron actualizar los permisos.');
    }
  };

  return (
    <Stack spacing={2}>
      <PageHeader
        eyebrow="Administración"
        title="Roles y permisos"
        subtitle="Creación de roles y gestión de permisos por rol."
      />

      <AdminRoleCreateForm
        roleName={roleName}
        roleDescription={roleDescription}
        creating={createRoleMutation.isPending}
        onRoleNameChange={setRoleName}
        onRoleDescriptionChange={setRoleDescription}
        onCreate={() => void onCreateRole()}
      />

      {rolesQuery.isError ? (
        <Alert severity="error">
          {rolesQuery.error instanceof Error
            ? rolesQuery.error.message
            : 'No se pudieron cargar roles.'}
        </Alert>
      ) : null}

      <AdminRolesTable
        rows={rolesQuery.data ?? []}
        loading={rolesQuery.isLoading}
        selectedRoleId={selectedRoleId}
        onSelectRole={(roleId) => {
          setSelectedRoleId(roleId);
          const selectedRole = (rolesQuery.data ?? []).find((role) => role.id === roleId);
          setSelectedPermissionIds(
            selectedRole ? selectedRole.permisos.map((permission) => permission.permisoId) : [],
          );
        }}
      />

      <AdminRolePermissionsEditor
        selectedRoleId={selectedRoleId}
        selectedPermissionIds={selectedPermissionIds}
        permissions={permissionsQuery.data ?? []}
        roles={rolesQuery.data ?? []}
        loading={permissionsQuery.isLoading}
        saving={setRolePermissionsMutation.isPending}
        onTogglePermission={onTogglePermission}
        onSave={() => void onSavePermissions()}
      />
    </Stack>
  );
}
