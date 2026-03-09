import { ApiProperty } from '@nestjs/swagger';

export class ActividadRecienteItemDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'EXPEDIENTE_UPDATE' })
  accion!: string;

  @ApiProperty({ example: 'Expediente' })
  recurso!: string;

  @ApiProperty({ example: 'EXITO' })
  resultado!: string;

  @ApiProperty({ example: '2026-03-09T14:20:10.000Z' })
  timestamp!: string;

  @ApiProperty({
    type: 'object',
    nullable: true,
    properties: {
      id: { type: 'string', format: 'uuid' },
      nombre: { type: 'string' },
    },
  })
  usuario!: { id: string; nombre: string } | null;

  @ApiProperty({
    type: 'object',
    nullable: true,
    properties: {
      id: { type: 'string', format: 'uuid' },
      codigo: { type: 'string' },
    },
  })
  expediente!: { id: string; codigo: string } | null;
}

export class ActividadRecienteResponseDto {
  @ApiProperty({ type: [ActividadRecienteItemDto] })
  data!: ActividadRecienteItemDto[];
}
