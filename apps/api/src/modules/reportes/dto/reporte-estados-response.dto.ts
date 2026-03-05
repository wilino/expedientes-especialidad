import { EstadoExpediente } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class ReporteEstadoItemDto {
  @ApiProperty({ enum: EstadoExpediente, example: EstadoExpediente.ABIERTO })
  estado!: EstadoExpediente;

  @ApiProperty({ example: 12 })
  total!: number;
}

export class ReporteEstadosResponseDto {
  @ApiProperty({ example: 42 })
  totalExpedientes!: number;

  @ApiProperty({ type: [ReporteEstadoItemDto] })
  porEstado!: ReporteEstadoItemDto[];
}
