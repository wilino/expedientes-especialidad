import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { Prisma, Documento } from '@prisma/client';

@Injectable()
export class DocumentosRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.DocumentoUncheckedCreateInput): Promise<Documento> {
    return this.prisma.documento.create({ data });
  }

  async findById(id: string): Promise<Documento | null> {
    return this.prisma.documento.findUnique({ where: { id } });
  }

  async findByExpedienteId(
    expedienteId: string,
    params?: { skip?: number; take?: number },
  ) {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.documento.findMany({
        where: { expedienteId },
        ...params,
        include: {
          usuario: { select: { id: true, nombre: true } },
        },
        orderBy: { fecha: 'desc' },
      }),
      this.prisma.documento.count({ where: { expedienteId } }),
    ]);

    return { data, total };
  }
}
