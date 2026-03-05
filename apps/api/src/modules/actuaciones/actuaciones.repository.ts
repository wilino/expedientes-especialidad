import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { Prisma, Actuacion } from '@prisma/client';
import { ActuacionesRepositoryPort } from './actuaciones.repository.port';

@Injectable()
export class ActuacionesRepository implements ActuacionesRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ActuacionUncheckedCreateInput): Promise<Actuacion> {
    return this.prisma.actuacion.create({ data });
  }

  async findByIdAndExpediente(
    id: string,
    expedienteId: string,
  ): Promise<Actuacion | null> {
    return this.prisma.actuacion.findFirst({
      where: { id, expedienteId },
    });
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

  async update(
    id: string,
    data: Prisma.ActuacionUpdateInput,
  ): Promise<Actuacion> {
    return this.prisma.actuacion.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.actuacion.delete({
      where: { id },
    });
  }
}
