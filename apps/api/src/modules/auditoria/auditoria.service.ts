import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditoriaRepository } from './auditoria.repository';

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
  constructor(private readonly auditoriaRepo: AuditoriaRepository) {}

  async registrar(entry: AuditEntry) {
    return this.auditoriaRepo.create(entry);
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    usuarioId?: string;
    expedienteId?: string;
    accion?: string;
    resultado?: string;
    desde?: Date;
    hasta?: Date;
  }) {
    return this.auditoriaRepo.findAll(params);
  }
}
