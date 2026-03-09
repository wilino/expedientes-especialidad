import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { EstadoExpediente } from '../../lib/contracts';
import { useAuth } from '../auth/use-auth';
import { createExpedientesApi } from './expedientes-api';

export function useExpedientesList(appliedQuery: string) {
  const { apiRequest } = useAuth();
  const queryClient = useQueryClient();
  const expedientesApi = useMemo(() => createExpedientesApi({ apiRequest }), [apiRequest]);

  const listQuery = useQuery({
    queryKey: ['expedientes', 'list', appliedQuery],
    queryFn: () => expedientesApi.listExpedientes(appliedQuery),
  });

  const createMutation = useMutation({
    mutationFn: ({ codigo, caratula }: { codigo: string; caratula: string }) =>
      expedientesApi.createExpediente(codigo, caratula),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['expedientes', 'list'] });
    },
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

  const changeEstadoMutation = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoExpediente }) =>
      expedientesApi.changeEstado(id, estado),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['expedientes', 'list'] });
      void queryClient.invalidateQueries({
        queryKey: ['expedientes', 'detail', variables.id],
      });
    },
  });

  return {
    listQuery,
    createMutation,
    updateMutation,
    changeEstadoMutation,
  };
}
