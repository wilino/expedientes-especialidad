import { RecordatorioPrioridad } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateRecordatorioDto {
  @ApiProperty({ minLength: 2, maxLength: 120 })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  titulo!: string;

  @ApiPropertyOptional({ maxLength: 191 })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  descripcion?: string;

  @ApiProperty({
    description: 'Fecha y hora en formato ISO 8601',
    example: '2026-03-10T14:00:00.000Z',
  })
  @IsISO8601()
  fechaHora!: string;

  @ApiPropertyOptional({
    enum: RecordatorioPrioridad,
    default: RecordatorioPrioridad.NORMAL,
  })
  @IsOptional()
  @IsEnum(RecordatorioPrioridad)
  prioridad?: RecordatorioPrioridad;
}
