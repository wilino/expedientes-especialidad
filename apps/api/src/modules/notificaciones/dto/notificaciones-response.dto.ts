import { NotificacionTipo, RecursoTipo } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class NotificacionItemDto {
  @ApiProperty({ example: '4fda9a38-f2c4-4fc2-8f2a-2cd9049a3a45' })
  id!: string;

  @ApiProperty({ enum: NotificacionTipo, example: NotificacionTipo.ALERTA })
  tipo!: NotificacionTipo;

  @ApiProperty({ example: 'Expediente #1024 vence en 2 días' })
  titulo!: string;

  @ApiProperty({ nullable: true, example: 'Juzgado 3ro Civil' })
  mensaje!: string | null;

  @ApiProperty({
    nullable: true,
    enum: RecursoTipo,
    example: RecursoTipo.EXPEDIENTE,
  })
  recursoTipo!: RecursoTipo | null;

  @ApiProperty({
    nullable: true,
    example: 'f0cc6043-0f22-45fe-9a2e-115c7657fef9',
  })
  recursoId!: string | null;

  @ApiProperty({ example: false })
  leida!: boolean;

  @ApiProperty({ example: '2026-03-09T14:20:10.000Z' })
  createdAt!: string;

  @ApiProperty({ example: false })
  readOnly!: boolean;

  @ApiProperty({ enum: ['persisted', 'fallback'], example: 'persisted' })
  source!: 'persisted' | 'fallback';
}

export class NotificacionesListResponseDto {
  @ApiProperty({ type: [NotificacionItemDto] })
  data!: NotificacionItemDto[];

  @ApiProperty({ example: 3 })
  unreadCount!: number;
}

export class NotificacionReadResponseDto {
  @ApiProperty({ example: 2 })
  unreadCount!: number;
}
