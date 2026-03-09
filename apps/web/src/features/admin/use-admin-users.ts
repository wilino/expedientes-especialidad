import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/use-auth';
import { createAdminApi } from './admin-api';
import type { CreateUserInput } from './types';

interface UseAdminUsersParams {
  skip: number;
  take: number;
}

export function useAdminUsers({ skip, take }: UseAdminUsersParams) {
  const { apiRequest } = useAuth();
  const queryClient = useQueryClient();
  const adminApi = useMemo(() => createAdminApi({ apiRequest }), [apiRequest]);

  const usersQuery = useQuery({
    queryKey: ['admin', 'users', skip, take],
    queryFn: () => adminApi.listUsers({ skip, take }),
  });

  const rolesQuery = useQuery({
    queryKey: ['admin', 'roles', 'catalog'],
    queryFn: () => adminApi.listRoles(),
  });

  const createUserMutation = useMutation({
    mutationFn: (payload: CreateUserInput) => adminApi.createUser(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  const toggleEstadoMutation = useMutation({
    mutationFn: (userId: string) => adminApi.toggleUserEstado(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  const assignRoleMutation = useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      adminApi.assignRole(userId, roleId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      void queryClient.invalidateQueries({
        queryKey: ['admin', 'user-roles', variables.userId],
      });
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      adminApi.removeRole(userId, roleId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      void queryClient.invalidateQueries({
        queryKey: ['admin', 'user-roles', variables.userId],
      });
    },
  });

  const userPermissionsMutation = useMutation({
    mutationFn: (userId: string) => adminApi.getUserPermissions(userId),
  });

  return {
    usersQuery,
    rolesQuery,
    createUserMutation,
    toggleEstadoMutation,
    assignRoleMutation,
    removeRoleMutation,
    userPermissionsMutation,
  };
}
