import { ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoExpediente } from '@prisma/client';
import { IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../shared/dto/pagination.dto';

export class FindExpedientesQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: EstadoExpediente })
  @IsOptional()
  @IsEnum(EstadoExpediente)
  estado?: EstadoExpediente;

  @ApiPropertyOptional({
    description: 'Búsqueda por código o carátula',
    example: 'EXP-2026',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Fecha inicio (ISO)',
  })
  @IsOptional()
  @IsISO8601()
  desde?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Fecha fin (ISO)',
  })
  @IsOptional()
  @IsISO8601()
  hasta?: string;
}
