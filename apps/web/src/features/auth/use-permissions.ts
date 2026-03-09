import { useAuth } from './use-auth';
import type { PermissionCode } from './permission-codes';

export function can(
  userPermissions: readonly string[] | undefined,
  permission: PermissionCode,
): boolean {
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }
  return userPermissions.includes(permission);
}

export function canAny(
  userPermissions: readonly string[] | undefined,
  permissions: readonly PermissionCode[],
): boolean {
  if (permissions.length === 0) {
    return true;
  }
  return permissions.some((permission) => can(userPermissions, permission));
}

export function canAll(
  userPermissions: readonly string[] | undefined,
  permissions: readonly PermissionCode[],
): boolean {
  if (permissions.length === 0) {
    return true;
  }
  return permissions.every((permission) => can(userPermissions, permission));
}

export function usePermissions() {
  const { user } = useAuth();
  const userPermissions = user?.permisos;

  return {
    userPermissions: userPermissions ?? [],
    can: (permission: PermissionCode) => can(userPermissions, permission),
    canAny: (permissions: readonly PermissionCode[]) =>
      canAny(userPermissions, permissions),
    canAll: (permissions: readonly PermissionCode[]) =>
      canAll(userPermissions, permissions),
  };
}
