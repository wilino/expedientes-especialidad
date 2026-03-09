import { Injectable } from '@nestjs/common';
import { Prisma, Recordatorio } from '@prisma/client';
import { PrismaService } from '../../prisma';
import {
  FindRecordatoriosParams,
  RecordatoriosRepositoryPort,
} from './recordatorios.repository.port';

@Injectable()
export class RecordatoriosRepository implements RecordatoriosRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findByUsuario(
    params: FindRecordatoriosParams,
  ): Promise<Recordatorio[]> {
    const where: Prisma.RecordatorioWhereInput = {
      usuarioId: params.usuarioId,
    };

    if (params.from || params.to) {
      where.fechaHora = {
        ...(params.from && { gte: params.from }),
        ...(params.to && { lte: params.to }),
      };
    }

    return this.prisma.recordatorio.findMany({
      where,
      orderBy: [{ completado: 'asc' }, { fechaHora: 'asc' }],
      take: params.take,
    });
  }

  async create(
    data: Prisma.RecordatorioUncheckedCreateInput,
  ): Promise<Recordatorio> {
    return this.prisma.recordatorio.create({ data });
  }

  async updateByIdForUsuario(
    id: string,
    usuarioId: string,
    data: Prisma.RecordatorioUpdateInput,
  ): Promise<Recordatorio | null> {
    const existing = await this.prisma.recordatorio.findFirst({
      where: { id, usuarioId },
      select: { id: true },
    });

    if (!existing) {
      return null;
    }

    return this.prisma.recordatorio.update({
      where: { id },
      data,
    });
  }
}
