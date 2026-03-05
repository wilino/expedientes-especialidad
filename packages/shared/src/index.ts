export enum EstadoExpediente {
  ABIERTO = 'ABIERTO',
  EN_TRAMITE = 'EN_TRAMITE',
  CERRADO = 'CERRADO',
  ARCHIVADO = 'ARCHIVADO',
}

/** Transiciones válidas de estado */
export const TRANSICIONES_VALIDAS: Record<EstadoExpediente, EstadoExpediente[]> = {
  [EstadoExpediente.ABIERTO]: [EstadoExpediente.EN_TRAMITE, EstadoExpediente.CERRADO],
  [EstadoExpediente.EN_TRAMITE]: [EstadoExpediente.CERRADO],
  [EstadoExpediente.CERRADO]: [EstadoExpediente.ARCHIVADO],
  [EstadoExpediente.ARCHIVADO]: [],
};
