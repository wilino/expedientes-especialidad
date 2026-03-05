import { createBrowserRouter } from 'react-router-dom';
import { RequireAuth } from '../features/auth/require-auth';
import { AppLayout } from '../features/layout/app-layout';
import { ActuacionesPage } from '../pages/actuaciones-page';
import { AdminPage } from '../pages/admin-page';
import { AuditoriaPage } from '../pages/auditoria-page';
import { DashboardPage } from '../pages/dashboard-page';
import { DocumentosPage } from '../pages/documentos-page';
import { ExpedientesPage } from '../pages/expedientes-page';
import { LoginPage } from '../pages/login-page';
import { ReportesPage } from '../pages/reportes-page';

export const appRouter = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'expedientes', element: <ExpedientesPage /> },
      { path: 'actuaciones', element: <ActuacionesPage /> },
      { path: 'documentos', element: <DocumentosPage /> },
      { path: 'auditoria', element: <AuditoriaPage /> },
      { path: 'reportes', element: <ReportesPage /> },
      { path: 'admin', element: <AdminPage /> },
    ],
  },
]);
