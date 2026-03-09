import { RecordatorioPrioridad, RecursoTipo } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class RecordatorioItemDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Audiencia Exp #1024' })
  titulo!: string;

  @ApiProperty({ nullable: true, example: 'Juzgado 5to civil' })
  descripcion!: string | null;

  @ApiProperty({ example: '2026-03-10T10:30:00.000Z' })
  fechaHora!: string;

  @ApiProperty({
    enum: RecordatorioPrioridad,
    example: RecordatorioPrioridad.URGENTE,
  })
  prioridad!: RecordatorioPrioridad;

  @ApiProperty({ example: false })
  completado!: boolean;

  @ApiProperty({ nullable: true, enum: RecursoTipo })
  recursoTipo!: RecursoTipo | null;

  @ApiProperty({ nullable: true, format: 'uuid' })
  recursoId!: string | null;

  @ApiProperty({ example: '2026-03-09T14:20:10.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-03-09T14:20:10.000Z' })
  updatedAt!: string;
}

export class RecordatoriosListResponseDto {
  @ApiProperty({ type: [RecordatorioItemDto] })
  data!: RecordatorioItemDto[];
}
