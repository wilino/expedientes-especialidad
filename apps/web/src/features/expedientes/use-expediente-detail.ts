import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/use-auth';
import { createExpedientesApi } from './expedientes-api';

interface UseExpedienteDetailOptions {
  canReadActuaciones: boolean;
  canReadDocumentos: boolean;
}

export function useExpedienteDetail(
  expedienteId: string | null,
  options: UseExpedienteDetailOptions,
) {
  const { apiRequest } = useAuth();
  const queryClient = useQueryClient();
  const expedientesApi = useMemo(() => createExpedientesApi({ apiRequest }), [apiRequest]);

  const detailQuery = useQuery({
    queryKey: ['expedientes', 'detail', expedienteId],
    queryFn: () => {
      if (!expedienteId) {
        throw new Error('Expediente no definido');
      }
      return expedientesApi.getExpediente(expedienteId);
    },
    enabled: !!expedienteId,
  });

  const actuacionesQuery = useQuery({
    queryKey: ['expedientes', 'actuaciones', expedienteId],
    queryFn: async () => {
      if (!expedienteId) {
        throw new Error('Expediente no definido');
      }
      const res = await expedientesApi.listActuaciones(expedienteId);
      return res.data;
    },
    enabled: !!expedienteId && options.canReadActuaciones,
  });

  const documentosQuery = useQuery({
    queryKey: ['expedientes', 'documentos', expedienteId],
    queryFn: async () => {
      if (!expedienteId) {
        throw new Error('Expediente no definido');
      }
      const res = await expedientesApi.listDocumentos(expedienteId);
      return res.data;
    },
    enabled: !!expedienteId && options.canReadDocumentos,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, caratula }: { id: string; caratula: string }) =>
      expedientesApi.updateExpediente(id, caratula),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['expedientes', 'list'] });
      void queryClient.invalidateQueries({
        queryKey: ['expedientes', 'detail', variables.id],
      });
    },
  });

  return {
    detailQuery,
    actuacionesQuery,
    documentosQuery,
    updateMutation,
  };
}
