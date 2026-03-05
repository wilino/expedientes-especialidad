import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsISO8601, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationDto } from '../../../shared/dto/pagination.dto';

const AUDIT_RESULTADOS = ['EXITO', 'DENEGADO', 'ERROR'] as const;

export class FindAuditoriaQueryDto extends PaginationDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  usuarioId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  expedienteId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accion?: string;

  @ApiPropertyOptional({ enum: AUDIT_RESULTADOS })
  @IsOptional()
  @IsIn(AUDIT_RESULTADOS)
  resultado?: (typeof AUDIT_RESULTADOS)[number];

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
