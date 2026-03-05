import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/use-auth';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/expedientes', label: 'Expedientes' },
  { to: '/actuaciones', label: 'Actuaciones' },
  { to: '/documentos', label: 'Documentos' },
  { to: '/auditoria', label: 'Auditoría' },
  { to: '/reportes', label: 'Reportes' },
  { to: '/admin', label: 'Admin' },
];

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <h1 className="brand-title">Expedientes</h1>
        <p className="brand-subtitle">Control legal y trazabilidad</p>

        <nav className="menu">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `menu-link${isActive ? ' menu-link-active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="app-content">
        <header className="topbar">
          <div>
            <p className="topbar-user">{user?.nombre}</p>
            <p className="topbar-meta">{user?.correo}</p>
          </div>
          <button className="ghost-button" onClick={() => void logout()}>
            Cerrar sesión
          </button>
        </header>

        <section className="view-container">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
