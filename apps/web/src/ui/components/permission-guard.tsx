import { type ReactNode, useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import type { PermissionCode } from '../../features/auth/permission-codes';
import { usePermissions } from '../../features/auth/use-permissions';

interface PermissionGuardProps {
  children: ReactNode;
  permissions: readonly PermissionCode[];
  requireAll?: boolean;
  redirectTo?: string;
}

export function PermissionGuard({
  children,
  permissions,
  requireAll = true,
  redirectTo = '/403',
}: PermissionGuardProps) {
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();
  const { canAll, canAny } = usePermissions();
  const deniedPathRef = useRef<string | null>(null);

  const hasAccess = requireAll ? canAll(permissions) : canAny(permissions);
  const pathKey = `${location.pathname}${location.search}`;

  useEffect(() => {
    if (hasAccess) {
      deniedPathRef.current = null;
      return;
    }

    if (deniedPathRef.current === pathKey) {
      return;
    }

    deniedPathRef.current = pathKey;
    enqueueSnackbar('No tienes permisos para acceder a esa página.', {
      variant: 'warning',
    });
  }, [enqueueSnackbar, hasAccess, pathKey]);

  if (!hasAccess) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
