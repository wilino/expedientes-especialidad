import { ApiProperty } from '@nestjs/swagger';

export class ReporteActividadPeriodoDto {
  @ApiProperty({ nullable: true, example: '2026-03-01T00:00:00.000Z' })
  desde!: string | null;

  @ApiProperty({ nullable: true, example: '2026-03-05T23:59:59.999Z' })
  hasta!: string | null;
}

export class ReporteActividadTotalesDto {
  @ApiProperty({ example: 10 })
  expedientesCreados!: number;

  @ApiProperty({ example: 24 })
  actuacionesRegistradas!: number;

  @ApiProperty({ example: 15 })
  documentosSubidos!: number;

  @ApiProperty({ example: 60 })
  eventosAuditoria!: number;
}

export class ReporteActividadResultadoItemDto {
  @ApiProperty({ example: 'EXITO' })
  resultado!: string;

  @ApiProperty({ example: 50 })
  total!: number;
}

export class ReporteActividadResponseDto {
  @ApiProperty({ type: ReporteActividadPeriodoDto })
  periodo!: ReporteActividadPeriodoDto;

  @ApiProperty({ type: ReporteActividadTotalesDto })
  totales!: ReporteActividadTotalesDto;

  @ApiProperty({ type: [ReporteActividadResultadoItemDto] })
  eventosPorResultado!: ReporteActividadResultadoItemDto[];
}
