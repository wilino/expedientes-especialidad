import { ApiProperty } from '@nestjs/swagger';

export class AuthMeDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  nombre!: string;

  @ApiProperty()
  correo!: string;

  @ApiProperty()
  estado!: boolean;

  @ApiProperty({ type: [String] })
  roles!: string[];

  @ApiProperty({ type: [String] })
  permisos!: string[];
}
