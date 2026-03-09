import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { LoadingState, PermissionGuard } from '../ui/components';
import { RequireAuth } from '../features/auth/require-auth';
import { AppLayout } from '../features/layout/app-layout';
import { AccessRules, type AccessRule } from '../features/auth/access-rules';

const LoginPage = lazy(async () => {
  const module = await import('../pages/login-page');
  return { default: module.LoginPage };
});

const DashboardPage = lazy(async () => {
  const module = await import('../pages/dashboard-page');
  return { default: module.DashboardPage };
});

const ExpedientesPage = lazy(async () => {
  const module = await import('../pages/expedientes-page');
  return { default: module.ExpedientesPage };
});

const ExpedienteDetailPage = lazy(async () => {
  const module = await import('../pages/expediente-detail-page');
  return { default: module.ExpedienteDetailPage };
});

const ActuacionesPage = lazy(async () => {
  const module = await import('../pages/actuaciones-page');
  return { default: module.ActuacionesPage };
});

const DocumentosPage = lazy(async () => {
  const module = await import('../pages/documentos-page');
  return { default: module.DocumentosPage };
});

const AuditoriaPage = lazy(async () => {
  const module = await import('../pages/auditoria-page');
  return { default: module.AuditoriaPage };
});

const ReportesPage = lazy(async () => {
  const module = await import('../pages/reportes-page');
  return { default: module.ReportesPage };
});

const AdminPage = lazy(async () => {
  const module = await import('../pages/admin-page');
  return { default: module.AdminPage };
});

const AdminUsersPage = lazy(async () => {
  const module = await import('../pages/admin-users-page');
  return { default: module.AdminUsersPage };
});

const AdminRolesPage = lazy(async () => {
  const module = await import('../pages/admin-roles-page');
  return { default: module.AdminRolesPage };
});

const ForbiddenPage = lazy(async () => {
  const module = await import('../pages/forbidden-page');
  return { default: module.ForbiddenPage };
});

function withSuspense(node: ReactNode) {
  return <Suspense fallback={<LoadingState message="Cargando vista..." />}>{node}</Suspense>;
}

function withGuard(node: ReactNode, rule: AccessRule) {
  return (
    <PermissionGuard
      permissions={rule.permissions}
      requireAll={rule.requireAll}
      redirectTo="/403"
    >
      {withSuspense(node)}
    </PermissionGuard>
  );
}

export const appRouter = createBrowserRouter([
  {
    path: '/login',
    element: withSuspense(<LoginPage />),
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: withGuard(<DashboardPage />, AccessRules.dashboard) },
      {
        path: 'expedientes',
        element: withGuard(<ExpedientesPage />, AccessRules.expedientes),
      },
      {
        path: 'expedientes/:id',
        element: withGuard(<ExpedienteDetailPage />, AccessRules.expedientes),
      },
      {
        path: 'actuaciones',
        element: withGuard(<ActuacionesPage />, AccessRules.actuaciones),
      },
      {
        path: 'documentos',
        element: withGuard(<DocumentosPage />, AccessRules.documentos),
      },
      {
        path: 'auditoria',
        element: withGuard(<AuditoriaPage />, AccessRules.auditoria),
      },
      {
        path: 'reportes',
        element: withGuard(<ReportesPage />, AccessRules.reportes),
      },
      {
        path: 'usuarios',
        element: withGuard(<AdminUsersPage />, AccessRules.adminUsers),
      },
      {
        path: 'roles',
        element: withGuard(<AdminRolesPage />, AccessRules.adminRoles),
      },
      {
        path: 'admin',
        element: withGuard(<AdminPage />, AccessRules.adminUsers),
      },
      { path: '403', element: withSuspense(<ForbiddenPage />) },
    ],
  },
]);
