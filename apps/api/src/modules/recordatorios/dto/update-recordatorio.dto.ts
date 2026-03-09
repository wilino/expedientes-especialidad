import { RecordatorioPrioridad } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateRecordatorioDto {
  @ApiPropertyOptional({ minLength: 2, maxLength: 120 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  titulo?: string;

  @ApiPropertyOptional({ maxLength: 191 })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Fecha y hora en formato ISO 8601',
    example: '2026-03-10T14:00:00.000Z',
  })
  @IsOptional()
  @IsISO8601()
  fechaHora?: string;

  @ApiPropertyOptional({ enum: RecordatorioPrioridad })
  @IsOptional()
  @IsEnum(RecordatorioPrioridad)
  prioridad?: RecordatorioPrioridad;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  completado?: boolean;
}
