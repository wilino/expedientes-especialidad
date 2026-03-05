import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../features/auth/use-auth';
import type { ReporteActividad, ReporteEstados } from '../lib/contracts';

export function ReportesPage() {
  const { apiRequest } = useAuth();
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [estados, setEstados] = useState<ReporteEstados | null>(null);
  const [actividad, setActividad] = useState<ReporteActividad | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const runReport = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (desde) {
        params.set('desde', new Date(`${desde}T00:00:00`).toISOString());
      }
      if (hasta) {
        params.set('hasta', new Date(`${hasta}T23:59:59`).toISOString());
      }

      const [estadosResponse, actividadResponse] = await Promise.all([
        apiRequest<ReporteEstados>('/reportes/estados'),
        apiRequest<ReporteActividad>(`/reportes/actividad?${params.toString()}`),
      ]);

      setEstados(estadosResponse);
      setActividad(actividadResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo generar reportes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stack">
      <div>
        <p className="eyebrow">Inteligencia operativa</p>
        <h2>Reportes</h2>
      </div>

      <form className="panel inline-toolbar form-grid" onSubmit={runReport}>
        <label className="field field-inline">
          Desde
          <input
            type="date"
            value={desde}
            onChange={(event) => setDesde(event.target.value)}
          />
        </label>
        <label className="field field-inline">
          Hasta
          <input
            type="date"
            value={hasta}
            onChange={(event) => setHasta(event.target.value)}
          />
        </label>
        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? 'Generando...' : 'Generar'}
        </button>
      </form>

      {error ? <p className="error-text">{error}</p> : null}

      {actividad ? (
        <section className="panel">
          <h3>Actividad</h3>
          <div className="metric-grid">
            <article className="metric-card">
              <p className="metric-label">Expedientes creados</p>
              <p className="metric-value">{actividad.totales.expedientesCreados}</p>
            </article>
            <article className="metric-card">
              <p className="metric-label">Actuaciones</p>
              <p className="metric-value">
                {actividad.totales.actuacionesRegistradas}
              </p>
            </article>
            <article className="metric-card">
              <p className="metric-label">Documentos</p>
              <p className="metric-value">{actividad.totales.documentosSubidos}</p>
            </article>
            <article className="metric-card">
              <p className="metric-label">Eventos auditoría</p>
              <p className="metric-value">{actividad.totales.eventosAuditoria}</p>
            </article>
          </div>
        </section>
      ) : null}

      {estados ? (
        <section className="panel">
          <h3>Estados de expedientes</h3>
          <ul className="simple-list">
            {estados.porEstado.map((item) => (
              <li key={item.estado}>
                <span>{item.estado}</span>
                <strong>{item.total}</strong>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
