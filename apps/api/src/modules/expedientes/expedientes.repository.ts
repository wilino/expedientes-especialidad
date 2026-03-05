import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { Prisma, Expediente, EstadoExpediente } from '@prisma/client';

@Injectable()
export class ExpedientesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ExpedienteUncheckedCreateInput): Promise<Expediente> {
    return this.prisma.expediente.create({ data });
  }

  async findById(id: string) {
    return this.prisma.expediente.findUnique({
      where: { id },
      include: {
        creador: { select: { id: true, nombre: true, correo: true } },
        _count: { select: { actuaciones: true, documentos: true } },
      },
    });
  }

  async findByCodigo(codigo: string): Promise<Expediente | null> {
    return this.prisma.expediente.findUnique({ where: { codigo } });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    estado?: EstadoExpediente;
    q?: string;
    desde?: Date;
    hasta?: Date;
  }) {
    const where: Prisma.ExpedienteWhereInput = {};

    if (params.estado) {
      where.estado = params.estado;
    }

    if (params.q) {
      where.OR = [
        { codigo: { contains: params.q, mode: 'insensitive' } },
        { caratula: { contains: params.q, mode: 'insensitive' } },
      ];
    }

    if (params.desde || params.hasta) {
      where.fechaApertura = {
        ...(params.desde && { gte: params.desde }),
        ...(params.hasta && { lte: params.hasta }),
      };
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.expediente.findMany({
        where,
        skip: params.skip,
        take: params.take,
        include: {
          creador: { select: { id: true, nombre: true } },
          _count: { select: { actuaciones: true, documentos: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.expediente.count({ where }),
    ]);

    return { data, total };
  }

  async update(id: string, data: Prisma.ExpedienteUpdateInput): Promise<Expediente> {
    return this.prisma.expediente.update({ where: { id }, data });
  }

  async updateEstado(id: string, estado: EstadoExpediente): Promise<Expediente> {
    return this.prisma.expediente.update({
      where: { id },
      data: { estado },
    });
  }

  async count(where?: Prisma.ExpedienteWhereInput): Promise<number> {
    return this.prisma.expediente.count({ where });
  }
}
