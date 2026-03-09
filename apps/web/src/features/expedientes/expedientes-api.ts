import type {
  ActuacionItem,
  DocumentoItem,
  EstadoExpediente,
  ExpedienteDetail,
  ExpedienteItem,
  PaginatedResponse,
} from '../../lib/contracts';

interface ExpedientesApiClient {
  apiRequest: <T>(path: string, init?: RequestInit) => Promise<T>;
}

export function createExpedientesApi({ apiRequest }: ExpedientesApiClient) {
  return {
    listExpedientes(q?: string, take = 50) {
      const query = new URLSearchParams({ take: String(take) });
      if (q?.trim()) {
        query.set('q', q.trim());
      }
      return apiRequest<PaginatedResponse<ExpedienteItem>>(`/expedientes?${query.toString()}`);
    },

    createExpediente(codigo: string, caratula: string) {
      return apiRequest<ExpedienteItem>('/expedientes', {
        method: 'POST',
        body: JSON.stringify({ codigo: codigo.trim(), caratula: caratula.trim() }),
      });
    },

    updateExpediente(id: string, caratula: string) {
      return apiRequest<ExpedienteItem>(`/expedientes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ caratula: caratula.trim() }),
      });
    },

    changeEstado(id: string, estado: EstadoExpediente) {
      return apiRequest(`/expedientes/${id}/estado`, {
        method: 'PATCH',
        body: JSON.stringify({ estado }),
      });
    },

    getExpediente(id: string) {
      return apiRequest<ExpedienteDetail>(`/expedientes/${id}`);
    },

    listActuaciones(expedienteId: string) {
      return apiRequest<PaginatedResponse<ActuacionItem>>(
        `/expedientes/${expedienteId}/actuaciones?take=100`,
      );
    },

    listDocumentos(expedienteId: string) {
      return apiRequest<PaginatedResponse<DocumentoItem>>(
        `/expedientes/${expedienteId}/documentos?take=100`,
      );
    },
  };
}
