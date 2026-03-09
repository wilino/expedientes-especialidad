import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/use-auth';
import { createAdminApi } from './admin-api';
import type { CreateRoleInput, SetRolePermissionsInput } from './types';

export function useAdminRoles(selectedRoleId: string | null) {
  const { apiRequest } = useAuth();
  const queryClient = useQueryClient();
  const adminApi = useMemo(() => createAdminApi({ apiRequest }), [apiRequest]);

  const rolesQuery = useQuery({
    queryKey: ['admin', 'roles'],
    queryFn: () => adminApi.listRoles(),
  });

  const permissionsQuery = useQuery({
    queryKey: ['admin', 'permissions'],
    queryFn: () => adminApi.listPermissions(),
  });

  const roleDetailQuery = useQuery({
    queryKey: ['admin', 'role-detail', selectedRoleId],
    queryFn: () => {
      if (!selectedRoleId) {
        throw new Error('RoleId no definido');
      }
      return adminApi.getRoleById(selectedRoleId);
    },
    enabled: !!selectedRoleId,
  });

  const createRoleMutation = useMutation({
    mutationFn: (payload: CreateRoleInput) => adminApi.createRole(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
    },
  });

  const setRolePermissionsMutation = useMutation({
    mutationFn: (payload: SetRolePermissionsInput) =>
      adminApi.setRolePermissions(payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
      void queryClient.invalidateQueries({
        queryKey: ['admin', 'role-detail', variables.roleId],
      });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  return {
    rolesQuery,
    permissionsQuery,
    roleDetailQuery,
    createRoleMutation,
    setRolePermissionsMutation,
  };
}
