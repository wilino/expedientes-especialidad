import { useEffect, useState } from 'react';
import { useAuth } from '../features/auth/use-auth';
import type { ReporteActividad, ReporteEstados } from '../lib/contracts';

export function DashboardPage() {
  const { apiRequest } = useAuth();
  const [estados, setEstados] = useState<ReporteEstados | null>(null);
  const [actividad, setActividad] = useState<ReporteActividad | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [estadosResponse, actividadResponse] = await Promise.all([
          apiRequest<ReporteEstados>('/reportes/estados'),
          apiRequest<ReporteActividad>('/reportes/actividad'),
        ]);
        setEstados(estadosResponse);
        setActividad(actividadResponse);
      } catch (e) {
        const message =
          e instanceof Error ? e.message : 'No se pudo cargar el dashboard';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [apiRequest]);

  if (loading) {
    return <p className="muted">Cargando dashboard...</p>;
  }

  if (error) {
    return <p className="error-text">{error}</p>;
  }

  return (
    <div className="stack">
      <div>
        <p className="eyebrow">Resumen operativo</p>
        <h2>Dashboard</h2>
      </div>

      <div className="metric-grid">
        <article className="panel metric-card">
          <p className="metric-label">Expedientes totales</p>
          <p className="metric-value">{estados?.totalExpedientes ?? 0}</p>
        </article>
        <article className="panel metric-card">
          <p className="metric-label">Actuaciones</p>
          <p className="metric-value">
            {actividad?.totales.actuacionesRegistradas ?? 0}
          </p>
        </article>
        <article className="panel metric-card">
          <p className="metric-label">Documentos subidos</p>
          <p className="metric-value">{actividad?.totales.documentosSubidos ?? 0}</p>
        </article>
        <article className="panel metric-card">
          <p className="metric-label">Eventos auditoría</p>
          <p className="metric-value">{actividad?.totales.eventosAuditoria ?? 0}</p>
        </article>
      </div>

      <div className="two-columns">
        <section className="panel">
          <h3>Expedientes por estado</h3>
          <ul className="simple-list">
            {(estados?.porEstado ?? []).map((item) => (
              <li key={item.estado}>
                <span>{item.estado}</span>
                <strong>{item.total}</strong>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h3>Auditoría por resultado</h3>
          <ul className="simple-list">
            {(actividad?.eventosPorResultado ?? []).map((item) => (
              <li key={item.resultado}>
                <span>{item.resultado}</span>
                <strong>{item.total}</strong>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
