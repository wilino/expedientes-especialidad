import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../features/auth/use-auth';
import type { DocumentoItem, PaginatedResponse } from '../lib/contracts';

export function DocumentosPage() {
  const { apiRequest, apiRequestBlob } = useAuth();
  const [searchParams] = useSearchParams();

  const initialExpedienteId = useMemo(
    () => searchParams.get('expedienteId') ?? '',
    [searchParams],
  );

  const [expedienteId, setExpedienteId] = useState(initialExpedienteId);
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<DocumentoItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const loadRows = async () => {
    if (!expedienteId.trim()) {
      setRows([]);
      setTotal(0);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await apiRequest<PaginatedResponse<DocumentoItem>>(
        `/expedientes/${expedienteId.trim()}/documentos?take=80`,
      );
      setRows(response.data);
      setTotal(response.total);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'No se pudieron cargar documentos',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialExpedienteId) {
      void loadRows();
    }
    // Solo carga inicial.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialExpedienteId]);

  const uploadDocument = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!expedienteId.trim()) {
      setError('Debe indicar un expedienteId');
      return;
    }

    if (!file) {
      setError('Debe seleccionar un archivo');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      await apiRequest(`/expedientes/${expedienteId.trim()}/documentos`, {
        method: 'POST',
        body: formData,
      });
      setFile(null);
      await loadRows();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo subir el documento');
    } finally {
      setUploading(false);
    }
  };

  const downloadDocument = async (doc: DocumentoItem) => {
    setError('');
    try {
      const blob = await apiRequestBlob(
        `/expedientes/${expedienteId.trim()}/documentos/${doc.id}/download`,
      );

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = doc.nombre;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo descargar archivo');
    }
  };

  return (
    <div className="stack">
      <div>
        <p className="eyebrow">Gestión documental</p>
        <h2>Documentos</h2>
      </div>

      <form className="panel stack" onSubmit={uploadDocument}>
        <label className="field">
          Expediente ID
          <input
            value={expedienteId}
            onChange={(event) => setExpedienteId(event.target.value)}
            placeholder="UUID del expediente"
            required
          />
        </label>

        <label className="field">
          Archivo
          <input
            type="file"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            required
          />
        </label>

        <div className="inline-toolbar">
          <button className="primary-button" type="submit" disabled={uploading}>
            {uploading ? 'Subiendo...' : 'Subir documento'}
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
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Hash</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{new Date(row.fecha).toLocaleString()}</td>
                  <td>{row.nombre}</td>
                  <td>{row.tipo}</td>
                  <td>{row.hash.slice(0, 14)}...</td>
                  <td>
                    <button
                      className="ghost-button"
                      type="button"
                      onClick={() => void downloadDocument(row)}
                    >
                      Descargar
                    </button>
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
