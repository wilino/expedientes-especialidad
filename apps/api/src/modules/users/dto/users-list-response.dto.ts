import { ApiProperty } from '@nestjs/swagger';
import { UserAdminResponseDto } from './user-admin-response.dto';

export class UsersListResponseDto {
  @ApiProperty({ type: [UserAdminResponseDto] })
  data!: UserAdminResponseDto[];

  @ApiProperty({ example: 42 })
  total!: number;
}
