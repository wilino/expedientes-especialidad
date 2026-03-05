import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({ example: '2026-03-05T10:00:00.000Z' })
  timestamp!: string;

  @ApiProperty({ example: '/api/expedientes' })
  path!: string;

  @ApiProperty({ example: 'Solicitud inválida' })
  message!: string;
}
