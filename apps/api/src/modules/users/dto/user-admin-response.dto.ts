import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserAdminRoleDto {
  @ApiProperty({ example: '97f0b6db-4a34-4029-a2da-250f740b465b' })
  id!: string;

  @ApiProperty({ example: 'admin' })
  nombre!: string;

  @ApiPropertyOptional({ example: 'Administrador del sistema' })
  descripcion?: string | null;
}

export class UserAdminResponseDto {
  @ApiProperty({ example: 'f9c4e2b6-31de-4eef-92be-e8e0f7eb3ebf' })
  id!: string;

  @ApiProperty({ example: 'Juan Pérez' })
  nombre!: string;

  @ApiProperty({ example: 'juan@example.com' })
  correo!: string;

  @ApiProperty({ example: true })
  estado!: boolean;

  @ApiProperty({ example: '2026-03-05T01:22:26.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-03-05T01:22:26.000Z' })
  updatedAt!: Date;

  @ApiProperty({ type: [UserAdminRoleDto] })
  roles!: UserAdminRoleDto[];

  @ApiPropertyOptional({
    type: [String],
    example: ['USER_MANAGE', 'EXPEDIENTE_READ'],
  })
  permisos?: string[];
}
