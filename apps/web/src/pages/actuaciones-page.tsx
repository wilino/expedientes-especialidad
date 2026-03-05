import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../features/auth/use-auth';
import type { ActuacionItem, PaginatedResponse } from '../lib/contracts';

export function ActuacionesPage() {
  const { apiRequest } = useAuth();
  const [searchParams] = useSearchParams();

  const initialExpedienteId = useMemo(
    () => searchParams.get('expedienteId') ?? '',
    [searchParams],
  );

  const [expedienteId, setExpedienteId] = useState(initialExpedienteId);
  const [tipo, setTipo] = useState('NOTA');
  const [descripcion, setDescripcion] = useState('');
  const [resultado, setResultado] = useState('');
  const [rows, setRows] = useState<ActuacionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadRows = async () => {
    if (!expedienteId.trim()) {
      setRows([]);
      setTotal(0);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await apiRequest<PaginatedResponse<ActuacionItem>>(
        `/expedientes/${expedienteId.trim()}/actuaciones?take=80`,
      );
      setRows(response.data);
      setTotal(response.total);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'No se pudieron cargar actuaciones',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialExpedienteId) {
      void loadRows();
    }
    // Solo carga inicial desde query param.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialExpedienteId]);

  const createActuacion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!expedienteId.trim()) {
      setError('Debe indicar un expedienteId');
      return;
    }

    try {
      await apiRequest(`/expedientes/${expedienteId.trim()}/actuaciones`, {
        method: 'POST',
        body: JSON.stringify({
          tipo: tipo.trim(),
          descripcion: descripcion.trim(),
          resultado: resultado.trim() || undefined,
        }),
      });

      setDescripcion('');
      setResultado('');
      await loadRows();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo registrar actuación');
    }
  };

  return (
    <div className="stack">
      <div>
        <p className="eyebrow">Trazado jurídico</p>
        <h2>Actuaciones</h2>
      </div>

      <form className="panel stack" onSubmit={createActuacion}>
        <label className="field">
          Expediente ID
          <input
            value={expedienteId}
            onChange={(event) => setExpedienteId(event.target.value)}
            placeholder="UUID del expediente"
            required
          />
        </label>

        <div className="two-columns form-grid">
          <label className="field">
            Tipo
            <input
              value={tipo}
              onChange={(event) => setTipo(event.target.value)}
              required
            />
          </label>
          <label className="field">
            Resultado
            <input
              value={resultado}
              onChange={(event) => setResultado(event.target.value)}
              placeholder="Opcional"
            />
          </label>
        </div>

        <label className="field">
          Descripción
          <input
            value={descripcion}
            onChange={(event) => setDescripcion(event.target.value)}
            required
          />
        </label>

        <div className="inline-toolbar">
          <button className="primary-button" type="submit">
            Registrar actuación
          </button>
          <button
            className="ghost-button"
            type="button"
            onClick={() => void loadRows()}
          >
            Recargar listado
          </button>
          <span className="muted">Total: {total}</span>
        </div>
      </form>

      {loading ? <p className="muted">Cargando...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      <section className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Resultado</th>
                <th>Usuario</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{new Date(row.fecha).toLocaleString()}</td>
                  <td>{row.tipo}</td>
                  <td>{row.descripcion}</td>
                  <td>{row.resultado ?? '-'}</td>
                  <td>{row.usuario?.nombre ?? row.usuarioId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
