import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { Prisma } from '@prisma/client';
import {
  AuditoriaRepositoryPort,
  FindAuditoriaParams,
} from './auditoria.repository.port';

@Injectable()
export class AuditoriaRepository implements AuditoriaRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.AuditLogUncheckedCreateInput) {
    return this.prisma.auditLog.create({ data });
  }

  async findAll(params: FindAuditoriaParams) {
    const where: Prisma.AuditLogWhereInput = {};

    if (params.usuarioId) where.usuarioId = params.usuarioId;
    if (params.expedienteId) where.expedienteId = params.expedienteId;
    if (params.accion) where.accion = params.accion;
    if (params.resultado) where.resultado = params.resultado;

    if (params.desde || params.hasta) {
      where.timestamp = {
        ...(params.desde && { gte: params.desde }),
        ...(params.hasta && { lte: params.hasta }),
      };
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        skip: params.skip,
        take: params.take,
        include: {
          usuario: { select: { id: true, nombre: true, correo: true } },
          expediente: { select: { id: true, codigo: true } },
        },
        orderBy: { timestamp: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data, total };
  }
}
