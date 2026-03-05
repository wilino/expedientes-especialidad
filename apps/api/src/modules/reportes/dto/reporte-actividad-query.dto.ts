import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional } from 'class-validator';

export class ReporteActividadQueryDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Fecha de inicio en formato ISO-8601',
    example: '2026-03-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsISO8601()
  desde?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Fecha de fin en formato ISO-8601',
    example: '2026-03-05T23:59:59.999Z',
  })
  @IsOptional()
  @IsISO8601()
  hasta?: string;
}
