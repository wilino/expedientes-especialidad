import { useEffect, useState } from 'react';
import { useAuth } from '../features/auth/use-auth';
import type { AuditLogItem, PaginatedResponse } from '../lib/contracts';

export function AuditoriaPage() {
  const { apiRequest } = useAuth();
  const [rows, setRows] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await apiRequest<PaginatedResponse<AuditLogItem>>(
          '/auditoria?take=80',
        );
        setRows(response.data);
        setTotal(response.total);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : 'No se pudo cargar la bitácora',
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
        <p className="eyebrow">Trazabilidad</p>
        <h2>Auditoría</h2>
      </div>

      <section className="panel">
        <p className="muted">Eventos registrados: {total}</p>
        {loading ? <p className="muted">Cargando...</p> : null}
        {error ? <p className="error-text">{error}</p> : null}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Usuario</th>
                <th>Acción</th>
                <th>Recurso</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{new Date(row.timestamp).toLocaleString()}</td>
                  <td>{row.usuario?.nombre ?? '-'}</td>
                  <td>{row.accion}</td>
                  <td>{row.recurso}</td>
                  <td>{row.resultado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
