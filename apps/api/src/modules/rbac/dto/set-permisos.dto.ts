import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetPermisosDto {
  @ApiProperty({ type: [String], description: 'IDs de permisos a asignar' })
  @IsArray()
  @IsUUID('4', { each: true })
  permisoIds!: string[];
}
