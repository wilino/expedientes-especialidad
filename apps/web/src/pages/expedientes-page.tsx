import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/use-auth';
import type { ExpedienteItem, PaginatedResponse } from '../lib/contracts';

type EstadoExpediente = 'ABIERTO' | 'EN_TRAMITE' | 'CERRADO' | 'ARCHIVADO';

export function ExpedientesPage() {
  const { apiRequest } = useAuth();
  const [expedientes, setExpedientes] = useState<ExpedienteItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [codigo, setCodigo] = useState('');
  const [caratula, setCaratula] = useState('');

  const loadExpedientes = async () => {
    setLoading(true);
    setError('');
    try {
      const query = new URLSearchParams({
        take: '50',
        ...(q.trim() ? { q: q.trim() } : {}),
      });

      const response = await apiRequest<PaginatedResponse<ExpedienteItem>>(
        `/expedientes?${query.toString()}`,
      );
      setExpedientes(response.data);
      setTotal(response.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar expedientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadExpedientes();
    // Solo carga inicial.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createExpediente = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      await apiRequest<ExpedienteItem>('/expedientes', {
        method: 'POST',
        body: JSON.stringify({
          codigo: codigo.trim(),
          caratula: caratula.trim(),
        }),
      });
      setCodigo('');
      setCaratula('');
      await loadExpedientes();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear expediente');
    }
  };

  const cambiarEstado = async (id: string, estado: EstadoExpediente) => {
    setError('');
    try {
      await apiRequest(`/expedientes/${id}/estado`, {
        method: 'PATCH',
        body: JSON.stringify({ estado }),
      });
      await loadExpedientes();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'No se pudo cambiar el estado del expediente',
      );
    }
  };

  return (
    <div className="stack">
      <div>
        <p className="eyebrow">Gestión de casos</p>
        <h2>Expedientes</h2>
      </div>

      <form className="panel two-columns form-grid" onSubmit={createExpediente}>
        <label className="field">
          Código
          <input
            value={codigo}
            onChange={(event) => setCodigo(event.target.value)}
            required
            placeholder="EXP-2026-001"
          />
        </label>

        <label className="field">
          Carátula
          <input
            value={caratula}
            onChange={(event) => setCaratula(event.target.value)}
            required
            placeholder="Demanda laboral - Juan Perez"
          />
        </label>

        <button className="primary-button" type="submit">
          Crear expediente
        </button>
      </form>

      <section className="panel">
        <div className="inline-toolbar">
          <label className="field field-inline">
            Buscar
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Código o carátula"
            />
          </label>
          <button className="ghost-button" onClick={() => void loadExpedientes()}>
            Filtrar
          </button>
          <span className="muted">Total: {total}</span>
        </div>

        {loading ? <p className="muted">Cargando...</p> : null}
        {error ? <p className="error-text">{error}</p> : null}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Carátula</th>
                <th>Estado</th>
                <th>Fecha apertura</th>
                <th>Cambio de estado</th>
                <th>Vistas</th>
              </tr>
            </thead>
            <tbody>
              {expedientes.map((item) => (
                <tr key={item.id}>
                  <td>{item.codigo}</td>
                  <td>{item.caratula}</td>
                  <td>{item.estado}</td>
                  <td>{new Date(item.fechaApertura).toLocaleDateString()}</td>
                  <td>
                    <select
                      value={item.estado}
                      onChange={(event) =>
                        void cambiarEstado(item.id, event.target.value as EstadoExpediente)
                      }
                    >
                      <option value="ABIERTO">ABIERTO</option>
                      <option value="EN_TRAMITE">EN_TRAMITE</option>
                      <option value="CERRADO">CERRADO</option>
                      <option value="ARCHIVADO">ARCHIVADO</option>
                    </select>
                  </td>
                  <td>
                    <div className="inline-toolbar">
                      <Link
                        className="ghost-button"
                        to={`/actuaciones?expedienteId=${item.id}`}
                      >
                        Actuaciones
                      </Link>
                      <Link
                        className="ghost-button"
                        to={`/documentos?expedienteId=${item.id}`}
                      >
                        Documentos
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
