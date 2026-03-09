import { EstadoExpediente, Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import {
  DashboardRepositoryPort,
  DateRange,
} from './dashboard.repository.port';

@Injectable()
export class DashboardRepository implements DashboardRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async getExpedientesCount(range?: DateRange): Promise<number> {
    const where: Prisma.ExpedienteWhereInput = {};
    if (range) {
      where.createdAt = { gte: range.from, lte: range.to };
    }

    return this.prisma.expediente.count({ where });
  }

  async getActuacionesCount(range?: DateRange): Promise<number> {
    const where: Prisma.ActuacionWhereInput = {};
    if (range) {
      where.createdAt = { gte: range.from, lte: range.to };
    }

    return this.prisma.actuacion.count({ where });
  }

  async getDocumentosCount(range?: DateRange): Promise<number> {
    const where: Prisma.DocumentoWhereInput = {};
    if (range) {
      where.createdAt = { gte: range.from, lte: range.to };
    }

    return this.prisma.documento.count({ where });
  }

  async getAuditoriaCount(range?: DateRange): Promise<number> {
    const where: Prisma.AuditLogWhereInput = {};
    if (range) {
      where.timestamp = { gte: range.from, lte: range.to };
    }

    return this.prisma.auditLog.count({ where });
  }

  async getExpedientesByEstado() {
    const grouped = await this.prisma.expediente.groupBy({
      by: ['estado'],
      _count: { _all: true },
    });

    return grouped.map((row) => ({
      estado: row.estado,
      total: row._count._all,
    }));
  }

  async getExpedientesResolvedCount(): Promise<number> {
    return this.prisma.expediente.count({
      where: {
        estado: { in: [EstadoExpediente.CERRADO, EstadoExpediente.ARCHIVADO] },
      },
    });
  }

  async getExpedientesWithDocumentsCount(): Promise<number> {
    const grouped = await this.prisma.documento.groupBy({
      by: ['expedienteId'],
    });

    return grouped.length;
  }

  async getRecordatoriosOverdueStats(usuarioId: string, until: Date) {
    const where: Prisma.RecordatorioWhereInput = {
      usuarioId,
      fechaHora: { lte: until },
    };

    const [total, completados] = await this.prisma.$transaction([
      this.prisma.recordatorio.count({ where }),
      this.prisma.recordatorio.count({ where: { ...where, completado: true } }),
    ]);

    return { total, completados };
  }

  async getRecordatoriosTodayCount(
    usuarioId: string,
    from: Date,
    to: Date,
  ): Promise<number> {
    return this.prisma.recordatorio.count({
      where: {
        usuarioId,
        completado: false,
        fechaHora: {
          gte: from,
          lte: to,
        },
      },
    });
  }

  async getUnreadNotificationsCount(usuarioId: string): Promise<number> {
    return this.prisma.notificacion.count({
      where: {
        usuarioId,
        leida: false,
      },
    });
  }
}
