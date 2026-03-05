import { useEffect, useState } from 'react';
import { useAuth } from '../features/auth/use-auth';
import type { PaginatedResponse, RolItem, UserItem } from '../lib/contracts';

export function AdminPage() {
  const { apiRequest } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<RolItem[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const [usersResponse, rolesResponse] = await Promise.all([
          apiRequest<PaginatedResponse<UserItem>>('/users?take=50'),
          apiRequest<RolItem[]>('/rbac/roles'),
        ]);
        setUsers(usersResponse.data);
        setRoles(rolesResponse);
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : 'No se pudieron cargar los datos de administración',
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [apiRequest]);

  return (
    <div className="stack">
      <div>
        <p className="eyebrow">Control de acceso</p>
        <h2>Administración</h2>
      </div>

      {loading ? <p className="muted">Cargando...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      <div className="two-columns">
        <section className="panel">
          <h3>Usuarios</h3>
          <ul className="simple-list">
            {users.map((user) => (
              <li key={user.id}>
                <span>
                  {user.nombre} <small>({user.correo})</small>
                </span>
                <strong>{user.estado ? 'Activo' : 'Inactivo'}</strong>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h3>Roles</h3>
          <ul className="simple-list">
            {roles.map((rol) => (
              <li key={rol.id}>
                <span>{rol.nombre}</span>
                <strong>{rol.descripcion ?? '-'}</strong>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
