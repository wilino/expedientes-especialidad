import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { Prisma, Actuacion } from '@prisma/client';

@Injectable()
export class ActuacionesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ActuacionUncheckedCreateInput): Promise<Actuacion> {
    return this.prisma.actuacion.create({ data });
  }

  async findByExpedienteId(
    expedienteId: string,
    params?: { skip?: number; take?: number },
  ) {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.actuacion.findMany({
        where: { expedienteId },
        ...params,
        include: {
          usuario: { select: { id: true, nombre: true } },
        },
        orderBy: { fecha: 'desc' },
      }),
      this.prisma.actuacion.count({ where: { expedienteId } }),
    ]);

    return { data, total };
  }
}
