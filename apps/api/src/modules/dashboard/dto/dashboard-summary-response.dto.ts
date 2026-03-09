import { EstadoExpediente } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class DashboardPeriodDto {
  @ApiProperty({ example: 30 })
  windowDays!: number;

  @ApiProperty({ example: '2026-02-08T00:00:00.000Z' })
  currentFrom!: string;

  @ApiProperty({ example: '2026-03-09T23:59:59.999Z' })
  currentTo!: string;

  @ApiProperty({ example: '2026-01-09T00:00:00.000Z' })
  previousFrom!: string;

  @ApiProperty({ example: '2026-02-08T00:00:00.000Z' })
  previousTo!: string;
}

export class DashboardKpiDto {
  @ApiProperty({ example: 'expedientes' })
  key!: string;

  @ApiProperty({ example: 'Expedientes' })
  label!: string;

  @ApiProperty({ example: 124 })
  value!: number;

  @ApiProperty({ example: 15 })
  currentWindowValue!: number;

  @ApiProperty({ example: 12 })
  previousWindowValue!: number;

  @ApiProperty({ example: 25 })
  trendPercent!: number;

  @ApiProperty({ enum: ['up', 'down', 'flat'], example: 'up' })
  trendDirection!: 'up' | 'down' | 'flat';
}

export class DashboardEstadoItemDto {
  @ApiProperty({ enum: EstadoExpediente, example: EstadoExpediente.EN_TRAMITE })
  estado!: EstadoExpediente;

  @ApiProperty({ example: 52 })
  total!: number;
}

export class DashboardSummaryResponseDto {
  @ApiProperty({ example: '2026-03-09T19:10:00.000Z' })
  generatedAt!: string;

  @ApiProperty({ type: DashboardPeriodDto })
  period!: DashboardPeriodDto;

  @ApiProperty({ type: [DashboardKpiDto] })
  kpis!: DashboardKpiDto[];

  @ApiProperty({ example: 3 })
  remindersToday!: number;

  @ApiProperty({ example: 4 })
  unreadNotifications!: number;

  @ApiProperty({ type: [DashboardEstadoItemDto] })
  expedientesByEstado!: DashboardEstadoItemDto[];
}
