import { useState } from 'react';
import { Alert, Stack } from '@mui/material';
import { PageHeader } from '../ui/components';
import { useFeedbackSnackbar } from '../ui/hooks/use-feedback-snackbar';
import { useAdminUsers } from '../features/admin/use-admin-users';
import {
  AdminUserActionsMenu,
  AdminUserPermissionsDialog,
  AdminUserRoleDialog,
  AdminUsersCreateForm,
  AdminUsersTable,
  AdminUserToggleDialog,
} from '../features/admin/users';
import type { AdminUserItem } from '../lib/contracts';
import { useAuth } from '../features/auth/use-auth';
import { PermissionCodes } from '../features/auth/permission-codes';
import { usePermissions } from '../features/auth/use-permissions';

const DEFAULT_ROWS_PER_PAGE = 10;

interface ToggleDialogState {
  open: boolean;
  userId: string;
  userName: string;
  currentEstado: boolean;
}

export function AdminUsersPage() {
  const feedback = useFeedbackSnackbar();
  const { user: authenticatedUser, logout } = useAuth();
  const { can } = usePermissions();
  const canManageUsers = can(PermissionCodes.USER_MANAGE);
  const canManageRbac = can(PermissionCodes.RBAC_MANAGE);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const [menuAnchor, setMenuAnchor] = useState<{
    el: HTMLElement;
    user: AdminUserItem;
  } | null>(null);
  const [roleDialog, setRoleDialog] = useState<{
    open: boolean;
    user: AdminUserItem | null;
    selectedRoleId: string;
  }>({ open: false, user: null, selectedRoleId: '' });
  const [permissionsDialog, setPermissionsDialog] = useState<{
    open: boolean;
    userName: string;
    permissions: string[];
  }>({
    open: false,
    userName: '',
    permissions: [],
  });
  const [toggleDialog, setToggleDialog] = useState<ToggleDialogState>({
    open: false,
    userId: '',
    userName: '',
    currentEstado: true,
  });

  const skip = page * rowsPerPage;
  const take = rowsPerPage;
  const {
    usersQuery,
    rolesQuery,
    createUserMutation,
    toggleEstadoMutation,
    assignRoleMutation,
    removeRoleMutation,
    userPermissionsMutation,
  } = useAdminUsers({ skip, take });

  const users = usersQuery.data?.data ?? [];
  const total = usersQuery.data?.total ?? 0;
  const roles = rolesQuery.data ?? [];

  const onCreateUser = async (values: {
    nombre: string;
    correo: string;
    password: string;
  }) => {
    try {
      await createUserMutation.mutateAsync(values);
      feedback.success('Usuario creado correctamente.');
    } catch (error) {
      feedback.error(error, 'No se pudo crear el usuario.');
      throw error;
    }
  };

  const onAssignRole = async () => {
    const { user, selectedRoleId } = roleDialog;
    if (!user || !selectedRoleId) {
      return;
    }

    try {
      await assignRoleMutation.mutateAsync({ userId: user.id, roleId: selectedRoleId });
      feedback.success('Rol asignado correctamente.');
      setRoleDialog((prev) => ({ ...prev, open: false }));

      if (authenticatedUser?.id === user.id) {
        feedback.info('Tus permisos cambiaron. Debes iniciar sesión nuevamente.');
        await logout();
      }
    } catch (error) {
      feedback.error(error, 'No se pudo asignar el rol.');
    }
  };

  const onRemoveRole = async () => {
    const { user, selectedRoleId } = roleDialog;
    if (!user || !selectedRoleId) {
      return;
    }

    try {
      await removeRoleMutation.mutateAsync({ userId: user.id, roleId: selectedRoleId });
      feedback.success('Rol removido correctamente.');
      setRoleDialog((prev) => ({ ...prev, open: false }));

      if (authenticatedUser?.id === user.id) {
        feedback.info('Tus permisos cambiaron. Debes iniciar sesión nuevamente.');
        await logout();
      }
    } catch (error) {
      feedback.error(error, 'No se pudo remover el rol.');
    }
  };

  const onViewPermissions = async (item: AdminUserItem) => {
    try {
      const permissions = await userPermissionsMutation.mutateAsync(item.id);
      setPermissionsDialog({
        open: true,
        userName: item.nombre,
        permissions,
      });
    } catch (error) {
      feedback.error(error, 'No se pudieron consultar los permisos del usuario.');
    }
  };

  const onConfirmToggleEstado = async () => {
    try {
      await toggleEstadoMutation.mutateAsync(toggleDialog.userId);
      feedback.success('Estado actualizado correctamente.');
      setToggleDialog((previous) => ({ ...previous, open: false }));

      if (authenticatedUser?.id === toggleDialog.userId) {
        await logout();
      }
    } catch (error) {
      feedback.error(error, 'No se pudo cambiar el estado.');
    }
  };

  return (
    <Stack spacing={2}>
      <PageHeader
        eyebrow="Administración"
        title="Usuarios"
        subtitle="Gestión de usuarios, roles y permisos efectivos."
      />

      {canManageUsers ? (
        <AdminUsersCreateForm
          isSubmitting={createUserMutation.isPending}
          onSubmit={onCreateUser}
        />
      ) : null}

      {usersQuery.isError ? (
        <Alert severity="error">
          {usersQuery.error instanceof Error
            ? usersQuery.error.message
            : 'No se pudo cargar usuarios.'}
        </Alert>
      ) : null}

      {canManageRbac && rolesQuery.isError ? (
        <Alert severity="error">
          {rolesQuery.error instanceof Error
            ? rolesQuery.error.message
            : 'No se pudo cargar roles.'}
        </Alert>
      ) : null}

      <AdminUsersTable
        rows={users}
        loading={usersQuery.isLoading}
        total={total}
        page={page}
        rowsPerPage={rowsPerPage}
        showActions={canManageUsers || canManageRbac}
        onPageChange={setPage}
        onRowsPerPageChange={(nextRowsPerPage) => {
          setRowsPerPage(nextRowsPerPage);
          setPage(0);
        }}
        onOpenActions={(event, user) => setMenuAnchor({ el: event.currentTarget, user })}
      />

      <AdminUserToggleDialog
        open={toggleDialog.open}
        userName={toggleDialog.userName}
        currentEstado={toggleDialog.currentEstado}
        loading={toggleEstadoMutation.isPending}
        onConfirm={() => void onConfirmToggleEstado()}
        onClose={() => setToggleDialog((previous) => ({ ...previous, open: false }))}
      />

      <AdminUserPermissionsDialog
        open={permissionsDialog.open}
        userName={permissionsDialog.userName}
        permissions={permissionsDialog.permissions}
        onClose={() =>
          setPermissionsDialog((previous) => ({
            ...previous,
            open: false,
          }))
        }
      />

      <AdminUserActionsMenu
        anchorEl={menuAnchor?.el ?? null}
        user={menuAnchor?.user ?? null}
        canManageRoles={canManageRbac}
        canViewPermissions={canManageRbac}
        canToggleState={canManageUsers}
        onClose={() => setMenuAnchor(null)}
        onManageRoles={() => {
          if (!menuAnchor) {
            return;
          }
          setRoleDialog({ open: true, user: menuAnchor.user, selectedRoleId: '' });
          setMenuAnchor(null);
        }}
        onViewPermissions={() => {
          if (!menuAnchor) {
            return;
          }
          void onViewPermissions(menuAnchor.user);
          setMenuAnchor(null);
        }}
        onToggleState={() => {
          if (!menuAnchor) {
            return;
          }
          setToggleDialog({
            open: true,
            userId: menuAnchor.user.id,
            userName: menuAnchor.user.nombre,
            currentEstado: menuAnchor.user.estado,
          });
          setMenuAnchor(null);
        }}
      />

      <AdminUserRoleDialog
        open={roleDialog.open}
        user={roleDialog.user}
        selectedRoleId={roleDialog.selectedRoleId}
        roles={roles}
        assigning={assignRoleMutation.isPending}
        removing={removeRoleMutation.isPending}
        onClose={() => setRoleDialog((prev) => ({ ...prev, open: false }))}
        onRoleChange={(roleId) => setRoleDialog((prev) => ({ ...prev, selectedRoleId: roleId }))}
        onAssign={() => void onAssignRole()}
        onRemove={() => void onRemoveRole()}
      />
    </Stack>
  );
}
