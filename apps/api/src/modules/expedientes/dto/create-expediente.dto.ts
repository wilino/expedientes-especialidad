import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExpedienteDto {
  @ApiProperty({ example: 'EXP-2026-0001' })
  @IsString()
  @IsNotEmpty()
  codigo!: string;

  @ApiProperty({ example: 'Caso Pérez vs. Gómez — Daños y perjuicios' })
  @IsString()
  @IsNotEmpty()
  caratula!: string;
}
