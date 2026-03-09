import type {
  AdminRoleItem,
  AdminPermissionItem,
  AdminUserItem,
  AdminUsersResponse,
} from '../../lib/contracts';
import type {
  CreateRoleInput,
  CreateUserInput,
  ListUsersParams,
  SetRolePermissionsInput,
} from './types';

interface AdminApiClient {
  apiRequest: <T>(path: string, init?: RequestInit) => Promise<T>;
}

function toQuery(params: ListUsersParams): string {
  const query = new URLSearchParams();
  if (typeof params.skip === 'number') {
    query.set('skip', String(params.skip));
  }
  if (typeof params.take === 'number') {
    query.set('take', String(params.take));
  }
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

export function createAdminApi({ apiRequest }: AdminApiClient) {
  return {
    listUsers(params: ListUsersParams = {}) {
      return apiRequest<AdminUsersResponse>(`/users${toQuery(params)}`);
    },

    createUser(payload: CreateUserInput) {
      return apiRequest<AdminUserItem>('/users', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    toggleUserEstado(userId: string) {
      return apiRequest<AdminUserItem>(`/users/${userId}/toggle-estado`, {
        method: 'PATCH',
      });
    },

    assignRole(userId: string, roleId: string) {
      return apiRequest<void>(`/users/${userId}/roles/${roleId}`, {
        method: 'POST',
      });
    },

    removeRole(userId: string, roleId: string) {
      return apiRequest<void>(`/users/${userId}/roles/${roleId}/remove`, {
        method: 'POST',
      });
    },

    getUserWithRoles(userId: string) {
      return apiRequest<AdminUserItem>(`/users/${userId}/roles`);
    },

    getUserPermissions(userId: string) {
      return apiRequest<string[]>(`/rbac/usuarios/${userId}/permisos`);
    },

    listRoles() {
      return apiRequest<AdminRoleItem[]>('/rbac/roles');
    },

    getRoleById(roleId: string) {
      return apiRequest<AdminRoleItem>(`/rbac/roles/${roleId}`);
    },

    createRole(payload: CreateRoleInput) {
      return apiRequest<AdminRoleItem>('/rbac/roles', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    listPermissions() {
      return apiRequest<AdminPermissionItem[]>('/rbac/permisos');
    },

    setRolePermissions(payload: SetRolePermissionsInput) {
      return apiRequest<void>(`/rbac/roles/${payload.roleId}/permisos`, {
        method: 'PUT',
        body: JSON.stringify({ permisoIds: payload.permissionIds }),
      });
    },
  };
}
