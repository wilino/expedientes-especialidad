import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { ActividadRepositoryPort } from './actividad.repository.port';

@Injectable()
export class ActividadRepository implements ActividadRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findRecent(limit: number) {
    return this.prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
      select: {
        id: true,
        accion: true,
        recurso: true,
        resultado: true,
        timestamp: true,
        usuario: {
          select: {
            id: true,
            nombre: true,
          },
        },
        expediente: {
          select: {
            id: true,
            codigo: true,
          },
        },
      },
    });
  }
}
