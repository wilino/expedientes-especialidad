import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EstadoExpediente } from '@prisma/client';

export class CambiarEstadoDto {
  @ApiProperty({ enum: EstadoExpediente, example: EstadoExpediente.EN_TRAMITE })
  @IsEnum(EstadoExpediente)
  estado!: EstadoExpediente;
}
