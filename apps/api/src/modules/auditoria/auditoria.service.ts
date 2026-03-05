import { Injectable, Inject } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  AUDITORIA_REPOSITORY,
  AuditoriaRepositoryPort,
  FindAuditoriaParams,
} from './auditoria.repository.port';

export interface AuditEntry {
  usuarioId: string;
  expedienteId?: string;
  accion: string;
  recurso: string;
  resultado: 'EXITO' | 'DENEGADO' | 'ERROR';
  ip?: string;
  payload?: Prisma.InputJsonValue;
}

@Injectable()
export class AuditoriaService {
  constructor(
    @Inject(AUDITORIA_REPOSITORY)
    private readonly auditoriaRepo: AuditoriaRepositoryPort,
  ) {}

  async registrar(entry: AuditEntry) {
    return this.auditoriaRepo.create(entry);
  }

  async findAll(params: FindAuditoriaParams) {
    return this.auditoriaRepo.findAll(params);
  }
}
