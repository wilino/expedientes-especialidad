import { EstadoExpediente } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

/**
 * Transiciones válidas de estado de un expediente.
 * Cumple OCP: para agregar un estado nuevo, solo se extiende este mapa.
 */
const TRANSICIONES_VALIDAS: ReadonlyMap<
  EstadoExpediente,
  readonly EstadoExpediente[]
> = new Map([
  [
    EstadoExpediente.ABIERTO,
    [EstadoExpediente.EN_TRAMITE, EstadoExpediente.CERRADO],
  ],
  [EstadoExpediente.EN_TRAMITE, [EstadoExpediente.CERRADO]],
  [EstadoExpediente.CERRADO, [EstadoExpediente.ARCHIVADO]],
  [EstadoExpediente.ARCHIVADO, []],
]);

export function validarTransicion(
  estadoActual: EstadoExpediente,
  nuevoEstado: EstadoExpediente,
): void {
  const destinos = TRANSICIONES_VALIDAS.get(estadoActual) ?? [];

  if (!destinos.includes(nuevoEstado)) {
    throw new BadRequestException(
      `Transición inválida: ${estadoActual} → ${nuevoEstado}. ` +
        `Transiciones permitidas desde ${estadoActual}: ${destinos.length ? destinos.join(', ') : 'ninguna'}`,
    );
  }
}
