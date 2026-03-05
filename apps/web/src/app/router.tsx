import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { LoadingState } from '../ui/components';
import { RequireAuth } from '../features/auth/require-auth';
import { AppLayout } from '../features/layout/app-layout';

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

function withSuspense(node: ReactNode) {
  return <Suspense fallback={<LoadingState message="Cargando vista..." />}>{node}</Suspense>;
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
      { index: true, element: withSuspense(<DashboardPage />) },
      { path: 'expedientes', element: withSuspense(<ExpedientesPage />) },
      { path: 'actuaciones', element: withSuspense(<ActuacionesPage />) },
      { path: 'documentos', element: withSuspense(<DocumentosPage />) },
      { path: 'auditoria', element: withSuspense(<AuditoriaPage />) },
      { path: 'reportes', element: withSuspense(<ReportesPage />) },
      { path: 'admin', element: withSuspense(<AdminPage />) },
    ],
  },
]);
