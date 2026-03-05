import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateActuacionDto {
  @ApiProperty({ example: 'NOTIFICACIÓN' })
  @IsString()
  @IsNotEmpty()
  tipo!: string;

  @ApiProperty({ example: 'Se notificó a la parte demandada' })
  @IsString()
  @IsNotEmpty()
  descripcion!: string;

  @ApiPropertyOptional({ example: 'Notificación entregada exitosamente' })
  @IsString()
  @IsOptional()
  resultado?: string;
}
