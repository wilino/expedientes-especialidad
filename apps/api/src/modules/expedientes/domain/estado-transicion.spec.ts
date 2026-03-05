import { BadRequestException } from '@nestjs/common';
import { EstadoExpediente } from '@prisma/client';
import { validarTransicion } from './estado-transicion';

describe('validarTransicion', () => {
  it('permite ABIERTO → EN_TRAMITE', () => {
    expect(() =>
      validarTransicion(EstadoExpediente.ABIERTO, EstadoExpediente.EN_TRAMITE),
    ).not.toThrow();
  });

  it('permite ABIERTO → CERRADO', () => {
    expect(() =>
      validarTransicion(EstadoExpediente.ABIERTO, EstadoExpediente.CERRADO),
    ).not.toThrow();
  });

  it('permite EN_TRAMITE → CERRADO', () => {
    expect(() =>
      validarTransicion(EstadoExpediente.EN_TRAMITE, EstadoExpediente.CERRADO),
    ).not.toThrow();
  });

  it('permite CERRADO → ARCHIVADO', () => {
    expect(() =>
      validarTransicion(EstadoExpediente.CERRADO, EstadoExpediente.ARCHIVADO),
    ).not.toThrow();
  });

  it('rechaza ABIERTO → ARCHIVADO', () => {
    expect(() =>
      validarTransicion(EstadoExpediente.ABIERTO, EstadoExpediente.ARCHIVADO),
    ).toThrow(BadRequestException);
  });

  it('rechaza EN_TRAMITE → ABIERTO (retroceso)', () => {
    expect(() =>
      validarTransicion(EstadoExpediente.EN_TRAMITE, EstadoExpediente.ABIERTO),
    ).toThrow(BadRequestException);
  });

  it('rechaza CERRADO → EN_TRAMITE (retroceso)', () => {
    expect(() =>
      validarTransicion(EstadoExpediente.CERRADO, EstadoExpediente.EN_TRAMITE),
    ).toThrow(BadRequestException);
  });

  it('rechaza ARCHIVADO → cualquier estado', () => {
    for (const estado of [
      EstadoExpediente.ABIERTO,
      EstadoExpediente.EN_TRAMITE,
      EstadoExpediente.CERRADO,
    ]) {
      expect(() =>
        validarTransicion(EstadoExpediente.ARCHIVADO, estado),
      ).toThrow(BadRequestException);
    }
  });

  it('incluye información del error en el mensaje', () => {
    try {
      validarTransicion(EstadoExpediente.ARCHIVADO, EstadoExpediente.ABIERTO);
      fail('Debería haber lanzado');
    } catch (e) {
      expect((e as BadRequestException).message).toContain('ARCHIVADO');
      expect((e as BadRequestException).message).toContain('ABIERTO');
    }
  });
});
