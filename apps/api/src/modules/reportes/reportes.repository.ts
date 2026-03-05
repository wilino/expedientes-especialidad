import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma';
import {
  ReporteActividadParams,
  ReporteActividadResult,
  ReporteEstadosResult,
  ReportesRepositoryPort,
} from './reportes.repository.port';

@Injectable()
export class ReportesRepository implements ReportesRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async getEstados(): Promise<ReporteEstadosResult> {
    const grouped = await this.prisma.expediente.groupBy({
      by: ['estado'],
      _count: { _all: true },
    });

    const porEstado = grouped.map((row) => ({
      estado: row.estado,
      total: row._count._all,
    }));

    const totalExpedientes = porEstado.reduce((acc, row) => acc + row.total, 0);

    return {
      totalExpedientes,
      porEstado,
    };
  }

  async getActividad(
    params: ReporteActividadParams,
  ): Promise<ReporteActividadResult> {
    const expedientesWhere: Prisma.ExpedienteWhereInput = {};
    const actuacionesWhere: Prisma.ActuacionWhereInput = {};
    const documentosWhere: Prisma.DocumentoWhereInput = {};
    const auditoriaWhere: Prisma.AuditLogWhereInput = {};

    if (params.desde || params.hasta) {
      const range = {
        ...(params.desde && { gte: params.desde }),
        ...(params.hasta && { lte: params.hasta }),
      };

      expedientesWhere.createdAt = range;
      actuacionesWhere.createdAt = range;
      documentosWhere.createdAt = range;
      auditoriaWhere.timestamp = range;
    }

    const [
      expedientesCreados,
      actuacionesRegistradas,
      documentosSubidos,
      eventosAuditoria,
    ] = await this.prisma.$transaction([
      this.prisma.expediente.count({ where: expedientesWhere }),
      this.prisma.actuacion.count({ where: actuacionesWhere }),
      this.prisma.documento.count({ where: documentosWhere }),
      this.prisma.auditLog.count({ where: auditoriaWhere }),
    ]);

    const eventosPorResultadoRaw = await this.prisma.auditLog.groupBy({
      by: ['resultado'],
      where: auditoriaWhere,
      _count: { _all: true },
    });

    const eventosPorResultado = eventosPorResultadoRaw.map((row) => ({
      resultado: row.resultado,
      total: row._count._all,
    }));

    return {
      periodo: {
        desde: params.desde?.toISOString() ?? null,
        hasta: params.hasta?.toISOString() ?? null,
      },
      totales: {
        expedientesCreados,
        actuacionesRegistradas,
        documentosSubidos,
        eventosAuditoria,
      },
      eventosPorResultado,
    };
  }
}
